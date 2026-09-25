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

// Checkout hostname prefix on a managed zone. Short because it counts against
// Cloudflare's 64-character certificate name limit.
export const MANAGED_ZONE_CHECKOUT_PREFIX = 'c.';

// Longest name Cloudflare will issue a certificate for (RFC 5280).
const MAX_HOSTNAME_LENGTH = 64;

// BigCommerce stops trying to issue the certificate after about six minutes
// (a 60s delay, then 10 retries at 30s).
const CHECKOUT_HOSTNAME_READY_TIMEOUT_MS = 6 * 60 * 1000;
const CHECKOUT_HOSTNAME_POLL_INTERVAL_MS = 10 * 1000;

// The checkout hostname for a managed-zone storefront, or undefined when it
// would exceed the certificate name limit (older, longer hostnames).
export function managedCheckoutHostname(storefrontHostname: string): string | undefined {
  const hostname = MANAGED_ZONE_CHECKOUT_PREFIX + normalizeHostname(storefrontHostname);

  return hostname.length <= MAX_HOSTNAME_LENGTH ? hostname : undefined;
}

// Whether the hostname serves a certificate a client accepts. Any HTTP
// response means the handshake worked; a bad certificate or name throws.
async function checkoutHostnameIsServing(hostname: string): Promise<boolean> {
  try {
    await fetch(`https://${hostname}/`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });

    return true;
  } catch {
    return false;
  }
}

// Waits for a newly provisioned checkout hostname's certificate.
export async function waitForCheckoutHostname(
  hostname: string,
  { timeoutMs = CHECKOUT_HOSTNAME_READY_TIMEOUT_MS, onWait }: CheckoutHostnameWaitOptions = {},
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let waited = false;

  for (;;) {
    // One probe at a time: each asks whether the certificate has issued yet.
    // eslint-disable-next-line no-await-in-loop
    if (await checkoutHostnameIsServing(hostname)) return true;

    if (Date.now() + CHECKOUT_HOSTNAME_POLL_INTERVAL_MS >= deadline) return false;

    if (!waited) {
      waited = true;
      onWait?.();
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, CHECKOUT_HOSTNAME_POLL_INTERVAL_MS));
  }
}

export interface CheckoutHostnameWaitOptions {
  timeoutMs?: number;
  // Called once, before the first wait, so the caller can explain the pause.
  onWait?: () => void;
}

// The checkout subdomain a merchant most likely wants:
// `https://www.example.com` → `https://checkout.example.com`.
//
// Strips only a leading `www.`. Reducing to the last two labels would suggest
// `https://checkout.co.uk` for a storefront on `www.example.co.uk`; prefixing
// the host as-is can never produce a bare public suffix and always satisfies
// the same-main-domain rule. Pre-fills an editable prompt, so a bad URL just
// means no suggestion.
//
// `managedZone` suggests the `c.` hostname native hosting uses instead.
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

// Zones native hosting generates hostnames under; mirrors ignition's
// `reservedBaseDomainSuffixes`. Not derived from `deployment_hostnames`, which
// also lists merchant domains.
const NATIVE_HOSTING_ZONES = [
  'catalyst-sandbox.store',
  'catalyst-sandbox-dev.store',
  'catalyst-sandbox-staging.store',
  'catalyst-sandbox-integration.store',
  'ignition-demo.store',
];

// Whether native hosting generated the hostname, as opposed to it being the
// merchant's own domain.
export function isManagedHostingHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);

  return NATIVE_HOSTING_ZONES.some((zone) => isSubdomainOf(host, zone));
}

// Whether checkout is on a different main domain from the storefront: the
// test `warnOnCrossDomainCheckout` makes, without the output.
export function isCrossDomainCheckout(site: ChannelSiteDetails): boolean {
  const storefrontHost = hostnameOf(findChannelSiteUrl(site, 'primary') ?? site.url);
  const checkoutUrl = findChannelSiteUrl(site, 'checkout');
  const checkoutHost = checkoutUrl ? hostnameOf(checkoutUrl) : undefined;

  return Boolean(storefrontHost && checkoutHost && !sharesMainDomain(storefrontHost, checkoutHost));
}

export interface CheckoutDomainReport {
  // True only when both hostnames were readable and don't share a registrable
  // domain. A missing or unreadable checkout URL is not "cross domain".
  crossDomain: boolean;
  // Undefined when checkout isn't cross-domain.
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
  const report = {
    crossDomain: true,
    storefrontOnManagedZone,
    suggestion: storefrontOnManagedZone
      ? suggestCheckoutUrl(storefrontUrl, { managedZone: true })
      : suggestion,
  };

  if (storefrontOnManagedZone) {
    // Setting the checkout URL is what provisions this hostname.
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
