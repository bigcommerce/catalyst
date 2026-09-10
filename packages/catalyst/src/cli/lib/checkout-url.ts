import { getDomain } from 'tldts';

import { type ChannelSiteDetails, findChannelSiteUrl } from './channels';
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

// The checkout subdomain a merchant most likely wants:
// `https://www.example.com` → `https://checkout.example.com`.
//
// Strips only a leading `www.`. Reducing to the last two labels would suggest
// `https://checkout.co.uk` for a storefront on `www.example.co.uk`; prefixing
// the host as-is can never produce a bare public suffix and always satisfies
// the same-main-domain rule. Pre-fills an editable prompt, so a bad URL just
// means no suggestion.
export function suggestCheckoutUrl(storefrontUrl: string): string | undefined {
  const host = hostnameOf(storefrontUrl);

  if (!host) return undefined;

  const base = normalizeHostname(host).replace(/^www\./, '');

  return `https://checkout.${base}`;
}

// Whether a hostname sits on a BigCommerce-managed hosting zone — the
// auto-generated `<project>.<zone>` address a deployment gets before a custom
// domain is attached. That's what governs checkout: a checkout subdomain there
// would be two levels deep and can't be issued a certificate, so no custom
// checkout URL is possible at all.
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
  // On a managed zone, no custom checkout URL can be issued a certificate.
  // Undefined means unknown — callers must not treat that as false.
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
  const report = { crossDomain: true, storefrontOnManagedZone, suggestion };

  if (storefrontOnManagedZone === false) {
    consola.info(
      `To put checkout on this channel's own domain, point ` +
        `${suggestion?.replace('https://', '') ?? 'your checkout subdomain'} at BigCommerce and ` +
        'provision a certificate for it there.',
    );

    return report;
  }

  if (storefrontOnManagedZone === true) {
    consola.info(
      `${storefrontHost} is an auto-generated deployment hostname, and a checkout subdomain of ` +
        'one cannot be issued a certificate — so no checkout URL can be set for this channel ' +
        'until its storefront is on a custom domain. Add one with `catalyst domains add`.',
    );

    return report;
  }

  consola.info(
    'BigCommerce requires the checkout URL to share a main domain with the storefront. Set one ' +
      'with `catalyst channels update --checkout-url <domain>` once it points at BigCommerce.',
  );

  return report;
}
