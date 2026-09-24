import { input } from '@inquirer/prompts';

import { resolveChannel } from './channel-site-flow';
import {
  deleteChannelCheckoutUrl,
  findChannelSiteUrl,
  getChannelSite,
  updateChannelCheckoutUrl,
} from './channels';
import {
  isManagedHostingHostname,
  managedCheckoutHostname,
  normalizeCheckoutUrl,
  suggestCheckoutUrl,
  waitForCheckoutHostname,
} from './checkout-url';
import { consola } from './logger';

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
