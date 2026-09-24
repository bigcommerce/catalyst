import { getDomain } from 'tldts';

import { type ChannelSiteDetails, findChannelSiteUrl } from './channels';
import { UserActionableError } from './errors';
import { consola } from './logger';

const normalizeHostname = (hostname: string) => hostname.toLowerCase().replace(/\.$/, '');

const isSubdomainOf = (hostname: string, parent: string) => hostname.endsWith(`.${parent}`);

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

// Whether two hostnames share a registrable domain — the relationship
// BigCommerce requires between a channel's storefront and its checkout URL.
//
// Uses the public suffix list rather than comparing labels. BigCommerce does a
// real registrable-domain comparison, which a hand-rolled rule can't match:
// `store-x.example.store` and `store-x.c.example.store` share a registrable
// domain and the API accepts that pairing, while `example.co.uk` and
// `other.co.uk` do not. Every label-counting approximation gets one of those
// two wrong, and being wrong here means telling a merchant to replace a working
// checkout URL.
//
// `getDomain` returns null for a hostname with no registrable domain (an IP, or
// a bare public suffix), which counts as not sharing.
export function sharesMainDomain(a: string, b: string): boolean {
  const first = getDomain(normalizeHostname(a));

  return first !== null && first === getDomain(normalizeHostname(b));
}

// Prefix for the checkout hostname on a BigCommerce-managed hosting zone.
// Deliberately short: Cloudflare enforces a 64-character certificate common
// name, and every character here comes out of the project name's budget.
export const MANAGED_ZONE_CHECKOUT_PREFIX = 'c.';

// The checkout subdomain a merchant most likely wants:
// `https://www.example.com` → `https://checkout.example.com`.
//
// Strips only a leading `www.`. Reducing to the last two labels would suggest
// `https://checkout.co.uk` for a storefront on `www.example.co.uk`; prefixing
// the host as-is can never produce a bare public suffix and always satisfies
// the same-main-domain rule. Pre-fills an editable prompt, so a bad URL just
// means no suggestion.
//
// `managedZone` switches to the shorter prefix native hosting actually
// provisions. A managed hostname is already `<project>.<zone>` with no `www.`,
// so suggesting `checkout.` there would name a hostname nobody will create.
export function suggestCheckoutUrl(
  storefrontUrl: string,
  { managedZone = false }: { managedZone?: boolean } = {},
): string | undefined {
  const host = hostnameOf(storefrontUrl);

  if (!host) return undefined;

  const normalized = normalizeHostname(host);

  if (managedZone) return `https://${MANAGED_ZONE_CHECKOUT_PREFIX}${normalized}`;

  return `https://checkout.${normalized.replace(/^www\./, '')}`;
}

// Validates only the unambiguous parts: parses as a URL, uses https. A bare
// hostname gets `https://` prefixed; path and query are dropped since the API
// wants an origin.
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

// The zones native hosting generates storefront hostnames under. Mirrors
// ignition's `reservedBaseDomainSuffixes`, which is how ignition itself tells a
// generated hostname from a merchant's domain; bcserver keys certificate
// provisioning off the same suffixes.
//
// Not derivable from a project's `deployment_hostnames`: merchant domains added
// with `catalyst domains add` appear there too, so their parents would pass as
// zones.
const NATIVE_HOSTING_ZONES = [
  'catalyst-sandbox.store',
  'catalyst-sandbox-dev.store',
  'catalyst-sandbox-staging.store',
  'catalyst-sandbox-integration.store',
  'ignition-demo.store',
];

// Whether a hostname is one native hosting generated — the `<project>.<zone>`
// address a deployment gets before a custom domain is attached. Its checkout
// hostname is provisioned by BigCommerce, not by the merchant, so telling them
// to point DNS they don't control at BigCommerce would be wrong.
export function isManagedHostingHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);

  return NATIVE_HOSTING_ZONES.some((zone) => isSubdomainOf(host, zone));
}

export interface CheckoutDomainReport {
  // True only when both hostnames were readable and don't share a registrable
  // domain. A missing or unreadable checkout URL is not "cross domain".
  crossDomain: boolean;
  // On a managed zone the checkout hostname is provisioned by BigCommerce
  // rather than the merchant, so the remedy differs. Undefined when the
  // checkout isn't cross-domain.
  storefrontOnManagedZone?: boolean;
  suggestion?: string;
}

// Warns when a channel's checkout domain doesn't share a main domain with its
// storefront, which breaks session and cart continuity under third-party-cookie
// restrictions. Nothing else surfaces it: the redirect is resolved server-side,
// so a storefront moved to a new domain keeps redirecting to the old checkout.
//
// Returns its verdict so each caller can pick a fitting follow-up —
// `channels checkout-url` offers to set the URL, `runChannelSiteUrlFlow` can be
// mid-deploy and prints a command instead.
//
// Never throws: a diagnostic must not fail the command that called it.
export function warnOnCrossDomainCheckout(site: ChannelSiteDetails): CheckoutDomainReport {
  const storefrontUrl = findChannelSiteUrl(site, 'primary') ?? site.url;
  const storefrontHost = hostnameOf(storefrontUrl);
  const checkoutUrl = findChannelSiteUrl(site, 'checkout');

  if (!storefrontHost) return { crossDomain: false };

  const suggestion = suggestCheckoutUrl(storefrontUrl);
  const checkoutHost = checkoutUrl ? hostnameOf(checkoutUrl) : undefined;

  // Nothing to compare, and the command reports the absence itself.
  if (!checkoutHost || sharesMainDomain(storefrontHost, checkoutHost)) {
    return { crossDomain: false, suggestion };
  }

  // Both cases warn: the consequence is identical, and cross-domain checkout
  // costs real carts. Only the cause differs, which changes the wording and the
  // remedy. Kept to one sentence each — this fires on every channel that has
  // never had a checkout URL set, so a paragraph would train people to skip it.
  if (site.isCheckoutUrlCustomized) {
    consola.warn(
      `This channel's checkout URL (${checkoutHost}) is on a different domain than its ` +
        `storefront (${storefrontHost}) — most likely a storefront URL change left it behind.`,
    );
  } else {
    consola.warn(
      `Checkout is on the default channel's domain (${checkoutHost}), not this channel's ` +
        `storefront (${storefrontHost}).`,
    );
  }

  consola.info(
    'Shopper sessions and carts may not carry into checkout in browsers that restrict ' +
      'cross-domain cookies.',
  );

  const storefrontOnManagedZone = isManagedHostingHostname(storefrontHost);
  // The prefix only matters once there's something to fix.
  const report = {
    crossDomain: true,
    storefrontOnManagedZone,
    suggestion: storefrontOnManagedZone
      ? suggestCheckoutUrl(storefrontUrl, { managedZone: true })
      : suggestion,
  };

  if (storefrontOnManagedZone) {
    // Setting the checkout URL is what provisions the hostname: BigCommerce
    // registers it and issues its certificate in response to the write.
    consola.info(
      `${storefrontHost} is an auto-generated deployment hostname, so its checkout hostname is ` +
        `${MANAGED_ZONE_CHECKOUT_PREFIX}${storefrontHost}. BigCommerce provisions it when it's ` +
        'set as the checkout URL, and its certificate takes a few minutes to issue. Set it with:',
    );
    consola.log(
      `  catalyst channels update --channel-id ${site.channelId} --checkout-url ${report.suggestion ?? '<domain>'}`,
    );

    return report;
  }

  consola.info(
    `To put checkout on this channel's own domain, point ` +
      `${suggestion?.replace('https://', '') ?? 'your checkout subdomain'} at BigCommerce and ` +
      'provision a certificate for it there.',
  );

  return report;
}
