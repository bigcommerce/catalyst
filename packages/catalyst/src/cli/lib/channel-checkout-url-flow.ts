import { input } from '@inquirer/prompts';

import { resolveChannel } from './channel-site-flow';
import { findChannelSiteUrl, getChannelSite, updateChannelCheckoutUrl } from './channels';
import { normalizeCheckoutUrl, suggestCheckoutUrl } from './checkout-url';
import { consola } from './logger';

export interface ChannelCheckoutUrlFlowOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  // Non-interactive overrides. When supplied, the corresponding prompt is
  // skipped.
  channelId?: number;
  url?: string;
}

// Prompts for a checkout URL and writes it to the channel.
//
// Unlike a site URL, a checkout URL can't be derived from the deployment: it's
// a merchant-owned subdomain that has to already point at BigCommerce with a
// certificate provisioned there, since BigCommerce — not this project's worker
// — serves checkout. So this asks, defaulting to the `checkout.` subdomain of
// the channel's storefront domain, which is what the same-main-domain rule
// makes the near-certain answer.
export async function runChannelCheckoutUrlFlow(
  options: ChannelCheckoutUrlFlowOptions,
): Promise<void> {
  const channel = await resolveChannel(options);
  const label = channel.name ? `"${channel.name}" (${channel.id})` : String(channel.id);

  const site = await getChannelSite(
    channel.id,
    options.storeHash,
    options.accessToken,
    options.apiHost,
  );

  const storefrontUrl = findChannelSiteUrl(site, 'primary') ?? site.url;
  const currentCheckoutUrl = findChannelSiteUrl(site, 'checkout');

  consola.info(`Channel ${label} storefront is ${storefrontUrl}.`);

  if (currentCheckoutUrl) {
    consola.info(
      `Checkout is currently ${currentCheckoutUrl}${
        site.isCheckoutUrlCustomized ? '' : ', inherited from the default channel'
      }.`,
    );
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
