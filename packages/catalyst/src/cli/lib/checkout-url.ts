import { getDomain } from 'tldts';

import { type ChannelSiteDetails, findChannelSiteUrl } from './channels';
import { UserActionableError } from './errors';
import { consola } from './logger';
import { fetchProjects } from './project';

export interface CheckoutDomainContext {
  storeHash: string;
  accessToken: string;
  apiHost: string;
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

// Cloudflare will not issue a certificate for a name longer than this, from
// the RFC 5280 limit on a certificate common name.
const MAX_HOSTNAME_LENGTH = 64;

// How long native hosting can take to get a certificate onto a freshly
// provisioned checkout hostname. BigCommerce checks Cloudflare 60s after
// creating the custom hostname and then retries 10 times at 30s, so six
// minutes is the point past which it has given up rather than still working.
const CHECKOUT_HOSTNAME_READY_TIMEOUT_MS = 6 * 60 * 1000;
const CHECKOUT_HOSTNAME_POLL_INTERVAL_MS = 10 * 1000;

// The checkout hostname native hosting provisions for a storefront on a managed
// zone. Derived rather than fetched: ignition builds the same name from the same
// prefix, so transporting it would only add a field that can disagree.
//
// Returns undefined when the result would exceed the certificate common-name
// limit. Hostnames generated before ignition reserved room for the prefix can be
// too long, and those projects have no checkout hostname to point at.
export function managedCheckoutHostname(storefrontHostname: string): string | undefined {
  const hostname = MANAGED_ZONE_CHECKOUT_PREFIX + normalizeHostname(storefrontHostname);

  return hostname.length <= MAX_HOSTNAME_LENGTH ? hostname : undefined;
}

// Whether the hostname terminates TLS with a certificate a client will accept.
//
// Any HTTP response means the handshake succeeded, which is the thing that
// matters; the status code is irrelevant, and checkout answers a bare GET with
// a redirect to the storefront when there is no cart. A rejected certificate or
// an unresolvable name throws, which is the signal we want.
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

// Waits for a freshly provisioned checkout hostname to serve a valid
// certificate.
//
// Worth the wait because `PUT .../site/checkout-url` does no certificate
// validation of its own: it accepts a hostname that shares a main domain with
// the storefront whether or not anything answers there. Setting it early leaves
// checkout resolving without a certificate, which is worse for a shopper than
// the inherited checkout URL it replaced.
export async function waitForCheckoutHostname(
  hostname: string,
  { timeoutMs = CHECKOUT_HOSTNAME_READY_TIMEOUT_MS, onWait }: CheckoutHostnameWaitOptions = {},
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let waited = false;

  for (;;) {
    // Sequential by nature: each probe asks whether the certificate has
    // issued yet, so there is nothing to parallelise.
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
  // Called once, before the first sleep, so a caller can explain the pause
  // rather than appearing to hang for minutes.
  onWait?: () => void;
}

// Resolves the checkout URL for a storefront on a managed hosting zone, waiting
// for native hosting to finish issuing its certificate.
//
// Returns undefined when there is nothing safe to set, leaving the caller on
// its existing path (a prompt, or no change) rather than writing a checkout URL
// that would not work.
export async function resolveProvisionedCheckoutUrl(
  storefrontHostname: string,
  { timeoutMs }: Pick<CheckoutHostnameWaitOptions, 'timeoutMs'> = {},
): Promise<string | undefined> {
  const hostname = managedCheckoutHostname(storefrontHostname);

  if (!hostname) {
    consola.warn(
      `${storefrontHostname} is too long to take a checkout prefix, so it has no checkout ` +
        'hostname. Checkout keeps its current URL.',
    );

    return undefined;
  }

  const ready = await waitForCheckoutHostname(hostname, {
    timeoutMs,
    onWait: () => consola.info(`Waiting for ${hostname} to finish provisioning its certificate...`),
  });

  if (!ready) {
    consola.warn(
      `${hostname} is not serving a certificate yet, so checkout keeps its current URL. ` +
        'Re-run with `--update-checkout-url` once it is ready.',
    );

    return undefined;
  }

  return `https://${hostname}`;
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

// Whether a hostname sits on a BigCommerce-managed hosting zone — the
// auto-generated `<project>.<zone>` address a deployment gets before a custom
// domain is attached. That's what governs the advice we give: a checkout
// hostname there is provisioned by native hosting, not by the merchant, so
// telling them to point DNS they don't control at BigCommerce would be wrong.
//
// The zone is derived from the store's own `deployment_hostnames` rather than
// hardcoded, so it survives a zone change.
//
// Deliberately not "is this registered as a custom domain on the linked
// project?" — an auto-generated hostname can appear in a project's domain list,
// and a real vanity domain often belongs to another project, so that test is
// wrong in both directions.
//
// Best-effort: failure resolves to `undefined` so the caller degrades to
// generic advice rather than losing the warning.
async function isManagedHostingHostname(
  hostname: string,
  context: CheckoutDomainContext,
): Promise<boolean | undefined> {
  try {
    const projects = await fetchProjects(context.storeHash, context.accessToken, context.apiHost);
    const zones = projects
      .flatMap((project) => project.deployment_hostnames)
      .map((deploymentHostname) => parentDomain(normalizeHostname(deploymentHostname)))
      .filter((zone) => zone.includes('.'));

    if (zones.length === 0) return undefined;

    const host = normalizeHostname(hostname);

    return zones.some((zone) => host === zone || isSubdomainOf(host, zone));
  } catch {
    return undefined;
  }
}

export interface CheckoutDomainReport {
  // True only when both hostnames were readable and don't share a registrable
  // domain. A missing or unreadable checkout URL is not "cross domain".
  crossDomain: boolean;
  // On a managed zone the checkout hostname is provisioned by native hosting
  // rather than the merchant, so the remedy differs. Undefined means unknown —
  // callers must not treat that as false.
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
export async function warnOnCrossDomainCheckout(
  site: ChannelSiteDetails,
  context: CheckoutDomainContext,
): Promise<CheckoutDomainReport> {
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

  const storefrontOnManagedZone = await isManagedHostingHostname(storefrontHost, context);
  // Only now do we know which prefix to suggest, and the early return above
  // deliberately skips the lookup that tells us.
  const report = {
    crossDomain: true,
    storefrontOnManagedZone,
    suggestion: storefrontOnManagedZone
      ? suggestCheckoutUrl(storefrontUrl, { managedZone: true })
      : suggestion,
  };

  if (storefrontOnManagedZone === false) {
    consola.info(
      `To put checkout on this channel's own domain, point ` +
        `${suggestion?.replace('https://', '') ?? 'your checkout subdomain'} at BigCommerce and ` +
        'provision a certificate for it there.',
    );

    return report;
  }

  if (storefrontOnManagedZone === true) {
    // TODO(LTRAC-1961): once native hosting provisions the checkout hostname,
    // this becomes "waiting on provisioning" rather than "not available yet".
    consola.info(
      `${storefrontHost} is an auto-generated deployment hostname. Its checkout hostname ` +
        `(${MANAGED_ZONE_CHECKOUT_PREFIX}${storefrontHost}) isn't provisioned yet, so a ` +
        "same-domain checkout URL can't be set for this channel yet.",
    );

    return report;
  }

  consola.info(
    'BigCommerce requires the checkout URL to share a main domain with the storefront. Set one ' +
      'with `catalyst channels update --checkout-url <domain>` once it points at BigCommerce.',
  );

  return report;
}
