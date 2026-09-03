import { type ChannelSiteDetails, findChannelSiteUrl } from './channels';
import { listDomains } from './domains';
import { consola } from './logger';

export interface CheckoutDomainContext {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  // Used only to tailor the advice — when absent or unresolvable, the generic
  // warning is still emitted.
  projectUuid?: string;
}

// Reduces a hostname to its last two labels. This is a heuristic, NOT a real
// registrable-domain lookup: without the public suffix list, `example.co.uk`
// and `other.co.uk` both reduce to `co.uk` and compare as equal.
//
// That tradeoff is deliberate *here*, because the only consumer is a warning:
// the failure mode is staying silent when we could have spoken up, never
// blocking a legitimate change. The write path makes no such guess —
// BigCommerce enforces the real rule and its rejection is surfaced verbatim
// (see `updateChannelCheckoutUrl`).
function mainDomain(hostname: string): string {
  return hostname.toLowerCase().split('.').slice(-2).join('.');
}

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export function sharesMainDomain(a: string, b: string): boolean {
  return mainDomain(a) === mainDomain(b);
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
    consola.info(
      `To fix it, point checkout.${mainDomain(storefrontHost)} at BigCommerce, provision a ` +
        'certificate for it there, then run:',
    );
    consola.log(
      `  catalyst channels checkout-url --url https://checkout.${mainDomain(storefrontHost)}`,
    );

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
