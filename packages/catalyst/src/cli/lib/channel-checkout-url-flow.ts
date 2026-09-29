import { confirm, input } from '@inquirer/prompts';

import { resolveChannel } from './channel-site-flow';
import {
  deleteChannelCheckoutUrl,
  findChannelSiteUrl,
  getChannelSite,
  updateChannelCheckoutUrl,
} from './channels';
import {
  hostnameOf,
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
  // On a managed zone the checkout hostname follows from this, so no prompt.
  storefrontHostname?: string;
  // Defaults to when BigCommerce stops trying to issue the certificate.
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

  // Called without the hostname, e.g. `deploy --update-checkout-url` alone, a
  // managed-zone storefront still has nothing to ask. An explicit URL is
  // written as given.
  const storefrontHostname = hostnameOf(storefrontUrl);

  if (
    options.url === undefined &&
    options.storefrontHostname === undefined &&
    storefrontHostname !== undefined &&
    (await setManagedCheckoutUrl({
      ...options,
      channelId: channel.id,
      label,
      storefrontHostname,
      timeoutMs: options.certificateTimeoutMs,
    }))
  ) {
    return;
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

// Points a managed-zone storefront's channel at its `c.` checkout hostname.
// Writes first, since the write is what provisions the hostname, then waits
// for the certificate and undoes the write if none issues. Resolves false off
// the managed zone, so the caller prompts instead.
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
    // Already set: writing it again would hit `canonical-in-use`.
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
  // Honour a saved decline. Off for explicit commands.
  respectOptOut: boolean;
  // What Enter answers. No after a deploy, where the offer wasn't asked for.
  defaultAnswer: boolean;
}

// Offers to move a managed-zone storefront's checkout onto its `c.` hostname.
// Never replaces a merchant's own custom checkout URL. Resolves whether it
// asked, so an explicit command can fall back to the cross-domain warning.
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
    default: options.defaultAnswer,
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
