import { confirm, input } from '@inquirer/prompts';

import { resolveChannel } from './channel-site-flow';
import {
  deleteChannelCheckoutUrl,
  findChannelSiteUrl,
  getChannelSite,
  updateChannelCheckoutUrl,
} from './channels';
import {
  isCrossDomainCheckout,
  isManagedHostingHostname,
  MANAGED_ZONE_CHECKOUT_PREFIX,
  managedCheckoutHostname,
  normalizeCheckoutUrl,
  suggestCheckoutUrl,
  waitForCheckoutHostname,
  warnOnCrossDomainCheckout,
} from './checkout-url';
import { consola } from './logger';
import { type getProjectConfig } from './project-config';

export interface ChannelCheckoutUrlFlowOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  // Non-interactive overrides. When supplied, the corresponding prompt is
  // skipped.
  channelId?: number;
  url?: string;
  // Set by a caller that already resolved the channel and fetched the site, so
  // the flow neither re-prompts nor re-reads.
  channelName?: string;
  storefrontUrl?: string;
  // The hostname the storefront was just pointed at. On a managed hosting zone
  // the checkout hostname follows from it, so the prompt is skipped.
  storefrontHostname?: string;
  // How long to wait for that hostname's certificate. Defaults to the point
  // BigCommerce gives up issuing it.
  certificateTimeoutMs?: number;
}

// Prompts for a checkout URL and writes it.
//
// Unlike a site URL this can't be derived from the deployment: BigCommerce —
// not this project's worker — serves checkout, so the domain must already point
// there with a certificate. Defaults to the `checkout.` subdomain of the
// storefront, which the same-main-domain rule makes the near-certain answer.
export async function runChannelCheckoutUrlFlow(
  options: ChannelCheckoutUrlFlowOptions,
): Promise<void> {
  const channel =
    options.channelId !== undefined
      ? { id: options.channelId, name: options.channelName }
      : await resolveChannel(options);
  const label = channel.name ? `"${channel.name}" (${channel.id})` : String(channel.id);

  if (
    options.storefrontHostname !== undefined &&
    (await setManagedCheckoutUrl({
      ...options,
      channelId: channel.id,
      label,
      storefrontHostname: options.storefrontHostname,
      timeoutMs: options.certificateTimeoutMs,
    }))
  ) {
    return;
  }

  let storefrontUrl = options.storefrontUrl;

  // The storefront URL only feeds the prompt default, so skip the read when the
  // caller already has it.
  if (!storefrontUrl) {
    const site = await getChannelSite(
      channel.id,
      options.storeHash,
      options.accessToken,
      options.apiHost,
    );

    storefrontUrl = findChannelSiteUrl(site, 'primary') ?? site.url;

    const currentCheckoutUrl = findChannelSiteUrl(site, 'checkout');

    consola.info(`Channel ${label} storefront is ${storefrontUrl}.`);

    if (currentCheckoutUrl) {
      consola.info(
        `Checkout is currently ${currentCheckoutUrl}${
          site.isCheckoutUrlCustomized ? '' : ', inherited from the default channel'
        }.`,
      );
    }
  }

  const answer =
    options.url ??
    (await input({
      message: 'Checkout URL for this channel (must share a main domain with the storefront)',
      default: suggestCheckoutUrl(storefrontUrl),
    }));

  const checkoutUrl = normalizeCheckoutUrl(answer);

  await updateChannelCheckoutUrl(
    channel.id,
    checkoutUrl,
    options.storeHash,
    options.accessToken,
    options.apiHost,
  );

  consola.success(`Updated channel ${label} checkout URL to ${checkoutUrl}.`);
}

interface ManagedCheckoutUrlOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  channelId: number;
  label: string;
  storefrontHostname: string;
  timeoutMs?: number;
}

// Points a channel whose storefront is on a managed hosting zone at its `c.`
// checkout hostname.
//
// The write comes first because it is what provisions the hostname: BigCommerce
// registers it and issues its certificate in response. Checkout fails there
// until the certificate issues, usually within a couple of minutes, so if it
// never does the write is undone rather than leaving checkout broken.
//
// Resolves false when the storefront isn't on a managed zone, so the caller
// prompts instead.
async function setManagedCheckoutUrl(options: ManagedCheckoutUrlOptions): Promise<boolean> {
  const { storeHash, accessToken, apiHost, channelId, label, storefrontHostname } = options;

  // On a custom domain the `c.` subdomain is the merchant's DNS, not ours.
  if (!isManagedHostingHostname(storefrontHostname)) return false;

  const hostname = managedCheckoutHostname(storefrontHostname);

  if (!hostname) {
    consola.warn(
      `${storefrontHostname} is too long to take a checkout prefix, so it has no checkout ` +
        'hostname. Checkout keeps its current URL.',
    );

    return true;
  }

  const checkoutUrl = `https://${hostname}`;
  const site = await getChannelSite(channelId, storeHash, accessToken, apiHost);

  if (site.isCheckoutUrlCustomized) {
    // A re-run finds it already set; writing it again would ask BigCommerce to
    // register a hostname it already holds.
    const alreadySet = site.urls.some(
      (entry) => entry.type === 'checkout' && entry.url.replace(/\/$/, '') === checkoutUrl,
    );

    if (!alreadySet) {
      consola.info(
        `Channel ${label} already has a custom checkout URL, so it was left alone. To replace ` +
          `it, run \`catalyst channels update --channel-id ${channelId} --checkout-url ${checkoutUrl}\`.`,
      );

      return true;
    }
  } else {
    await updateChannelCheckoutUrl(channelId, checkoutUrl, storeHash, accessToken, apiHost);
    consola.success(`Updated channel ${label} checkout URL to ${checkoutUrl}.`);
  }

  const ready = await waitForCheckoutHostname(hostname, {
    timeoutMs: options.timeoutMs,
    onWait: () =>
      consola.info(
        `Waiting for ${hostname} to be issued a certificate. This usually takes a minute or two...`,
      ),
  });

  if (ready) {
    consola.success(`${hostname} is serving checkout.`);

    return true;
  }

  await deleteChannelCheckoutUrl(channelId, storeHash, accessToken, apiHost);
  consola.warn(
    `${hostname} wasn't issued a certificate in time, so the checkout URL was removed and ` +
      "checkout falls back to the default channel's. Re-run with `--update-checkout-url` to " +
      'try again.',
  );

  return true;
}

export interface ManagedCheckoutOfferOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  channelId: number;
  // The storefront hostname the channel's primary URL is on.
  storefrontHostname: string;
  config: ReturnType<typeof getProjectConfig>;
  // Skip the offer for a channel whose owner already declined it. Off for an
  // explicit command, which asks regardless.
  respectOptOut: boolean;
}

// Offers to move a managed-zone storefront's checkout onto its `c.` hostname,
// when checkout is on another domain. A decline is saved per channel. Resolves
// whether the offer was made, so an explicit command can fall back to the
// cross-domain warning when it wasn't.
//
// A custom checkout URL on another domain was the merchant's choice, so it's
// never offered for replacement. Off the managed zone there is no `c.`
// hostname to offer; that storefront's checkout is the merchant's to set up.
export async function offerManagedCheckoutUrl(
  options: ManagedCheckoutOfferOptions,
): Promise<boolean> {
  const { storeHash, accessToken, apiHost, channelId, storefrontHostname, config } = options;
  const declined = config.get('declinedCheckoutUrlChannels') ?? [];

  if (!isManagedHostingHostname(storefrontHostname)) return false;
  if (options.respectOptOut && declined.includes(channelId)) return false;

  const site = await getChannelSite(channelId, storeHash, accessToken, apiHost);

  if (site.isCheckoutUrlCustomized || !isCrossDomainCheckout(site)) return false;

  const shouldMove = await confirm({
    message:
      `Checkout is on ${findChannelSiteUrl(site, 'checkout') ?? 'another domain'}. Move it to ` +
      `https://${MANAGED_ZONE_CHECKOUT_PREFIX}${storefrontHostname} so shoppers stay on this ` +
      'domain through payment?',
    default: true,
  });

  if (!shouldMove) {
    if (!declined.includes(channelId)) {
      config.set('declinedCheckoutUrlChannels', [...declined, channelId]);
    }

    warnOnCrossDomainCheckout(site);
    consola.info(
      `Won't ask again after deploys for channel ${channelId}. To set it later, run ` +
        `\`catalyst channels update --channel-id ${channelId} --checkout-url ` +
        `https://${MANAGED_ZONE_CHECKOUT_PREFIX}${storefrontHostname}\`.`,
    );

    return true;
  }

  await runChannelCheckoutUrlFlow({
    storeHash,
    accessToken,
    apiHost,
    channelId,
    storefrontHostname,
  });

  return true;
}
