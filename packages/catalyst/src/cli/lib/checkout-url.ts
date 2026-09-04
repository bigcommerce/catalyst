import { type ChannelSiteDetails, findChannelSiteUrl } from './channels';
import { listDomains } from './domains';
import { UserActionableError } from './errors';
import { consola } from './logger';

export interface CheckoutDomainContext {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  // Used only to tailor the advice — when absent or unresolvable, the generic
  // warning is still emitted.
  projectUuid?: string;
}

const normalizeHostname = (hostname: string) => hostname.toLowerCase().replace(/\.$/, '');

const parentDomain = (hostname: string) => hostname.split('.').slice(1).join('.');

const isSubdomainOf = (hostname: string, parent: string) => hostname.endsWith(`.${parent}`);

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

// Whether two hostnames sit under the same registrable domain, which is the
// relationship BigCommerce requires between a channel's storefront and its
// checkout URL.
//
// Decided without the public suffix list, so it is a heuristic — but a
// deliberately conservative one. Two hostnames count as sharing only when one
// is a subdomain of the other, or when they have the same immediate parent and
// that parent has at least two labels. The label floor is what stops a bare
// public suffix from being the thing that makes them "match": `example.co.uk`
// and `other.co.uk` have parents `example.co.uk` and `other.co.uk`, so they
// correctly do not share, where comparing last-two-labels would have collapsed
// both to `co.uk` and stayed silent on a genuinely cross-domain setup.
//
// The residual imprecision runs the safe way. A deeply nested pair such as
// `a.b.example.com` and `c.d.example.com` compares as not sharing and earns a
// warning it doesn't need, which is noise rather than a missed problem. The
// write path makes no guess at all: BigCommerce enforces the real rule and its
// rejection is surfaced verbatim (see `updateChannelCheckoutUrl`).
export function sharesMainDomain(a: string, b: string): boolean {
  const first = normalizeHostname(a);
  const second = normalizeHostname(b);

  if (first === second) return true;

  if (isSubdomainOf(first, second) || isSubdomainOf(second, first)) return true;

  const parent = parentDomain(first);

  return parent === parentDomain(second) && parent.split('.').length >= 2;
}

// Validates only what is unambiguous: that the value is a URL and uses https.
// The domain *relationship* rule is left to BigCommerce for the reason given on
// `sharesMainDomain` above — a local guess would reject valid setups. A bare
// hostname gets `https://` prefixed, matching how `runChannelSiteUrlFlow`
// treats site URLs, and any path or query is dropped since the API wants an
// origin.
export function normalizeCheckoutUrl(value: string): string {
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  let parsed: URL;

  try {
    parsed = new URL(withScheme);
  } catch {
    throw new UserActionableError(
      `"${value}" is not a valid URL. Pass a hostname or an https URL, e.g. https://checkout.example.com.`,
    );
  }

  if (parsed.protocol !== 'https:') {
    throw new UserActionableError(
      `The checkout URL must use https, but "${value}" uses ${parsed.protocol.replace(':', '')}.`,
    );
  }

  return parsed.origin;
}

// The checkout subdomain a merchant most likely wants for a given storefront
// URL: `https://www.example.com` suggests `https://checkout.example.com`.
//
// Only a leading `www.` is stripped — deriving the registrable domain would
// need the public suffix list, and reducing to the last two labels would
// suggest nonsense like `https://checkout.co.uk` for a storefront on
// `www.example.co.uk`. Prefixing the storefront host (minus `www.`) can never
// produce a bare public suffix, and always satisfies the same-main-domain rule.
// This only pre-fills an editable prompt, so an unparseable storefront URL just
// means no suggestion.
export function suggestCheckoutUrl(storefrontUrl: string): string | undefined {
  const host = hostnameOf(storefrontUrl);

  if (!host) return undefined;

  const base = normalizeHostname(host).replace(/^www\./, '');

  return `https://checkout.${base}`;
}

// Whether the storefront hostname is a custom domain the merchant added to this
// project. Best-effort: any failure (no linked project, missing scope, API
// trouble) resolves to `undefined` so the caller degrades to generic advice
// rather than losing the warning entirely.
async function isProjectCustomDomain(
  hostname: string,
  context: CheckoutDomainContext,
): Promise<boolean | undefined> {
  if (!context.projectUuid) return undefined;

  try {
    const domains = await listDomains(
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    return domains.some((entry) => entry.domain.toLowerCase() === hostname.toLowerCase());
  } catch {
    return undefined;
  }
}

// Warns when a channel's checkout domain doesn't share a main domain with its
// storefront. That split is what breaks session and cart continuity between the
// two under third-party-cookie restrictions, and nothing else in the CLI
// surfaces it — the checkout redirect is resolved server-side, so a storefront
// pointed at a new domain keeps silently redirecting to the old checkout host.
//
// Keyed on the domain *relationship* rather than on a known hosting-zone
// suffix: the CLI has no such constant, and hardcoding one would rot the moment
// the zone changes.
//
// Never throws — a diagnostic must not fail the command that called it.
export async function warnOnCrossDomainCheckout(
  site: ChannelSiteDetails,
  context: CheckoutDomainContext,
): Promise<void> {
  const storefrontHost = hostnameOf(findChannelSiteUrl(site, 'primary') ?? site.url);
  const checkoutUrl = findChannelSiteUrl(site, 'checkout');

  // With no checkout URL on the site there's nothing to compare. The command
  // already reports the absence, so stay quiet here.
  if (!storefrontHost || !checkoutUrl) return;

  const checkoutHost = hostnameOf(checkoutUrl);

  if (!checkoutHost || sharesMainDomain(storefrontHost, checkoutHost)) return;

  consola.warn(
    `Checkout for this channel is on ${checkoutHost}, a different domain than the storefront ` +
      `(${storefrontHost}). Shopper sessions and carts may not carry into checkout in browsers ` +
      'that restrict cross-domain cookies.',
  );

  const isCustomDomain = await isProjectCustomDomain(storefrontHost, context);

  if (isCustomDomain === true) {
    const suggestion = suggestCheckoutUrl(`https://${storefrontHost}`);

    consola.info(
      `To fix it, point ${suggestion?.replace('https://', '') ?? 'your checkout subdomain'} at ` +
        'BigCommerce, provision a certificate for it there, then run:',
    );
    consola.log(`  catalyst channels checkout-url --url ${suggestion ?? '<url>'}`);

    return;
  }

  if (isCustomDomain === false) {
    consola.info(
      `${storefrontHost} looks like an auto-generated deployment hostname. BigCommerce requires ` +
        'the checkout URL to share a main domain with the storefront, and a checkout subdomain ' +
        'of an auto-generated hostname cannot be issued a certificate — so this channel has to ' +
        'use the shared checkout domain. Add a custom domain with `catalyst domains add` first ' +
        'if you need checkout on your own domain.',
    );

    return;
  }

  consola.info(
    'BigCommerce requires the checkout URL to share a main domain with the storefront. Set one ' +
      'with `catalyst channels checkout-url --url <url>` once the domain points at BigCommerce.',
  );
}
