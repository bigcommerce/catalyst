import { confirm } from '@inquirer/prompts';

import { runChannelCheckoutUrlFlow } from './channel-checkout-url-flow';
import { runChannelSiteUrlFlow } from './channel-site-flow';
import { findChannelSiteUrl, getChannelSite } from './channels';
import {
  isCrossDomainCheckout,
  isManagedHostingHostname,
  MANAGED_ZONE_CHECKOUT_PREFIX,
  warnOnCrossDomainCheckout,
} from './checkout-url';
import { type DeploymentSecret } from './env-config';
import { consola } from './logger';
import { fetchProjects } from './project';
import { type getProjectConfig } from './project-config';

export interface DeployChannelUrlOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  projectUuid: string;
  config: ReturnType<typeof getProjectConfig>;
  // The hostname the deploy just went live on.
  deploymentHostname?: string;
  // The channel the storefront was built for, if known.
  channelId?: number;
}

// The channel a deployment serves: the build reads `BIGCOMMERCE_CHANNEL_ID`
// from the env files, and a stored secret carries it when the build was skipped
// with `--prebuilt`.
export function deployedChannelId(secrets: DeploymentSecret[]): number | undefined {
  const raw =
    process.env.BIGCOMMERCE_CHANNEL_ID ??
    secrets.find((secret) => secret.key === 'BIGCOMMERCE_CHANNEL_ID')?.value;
  const id = Number(raw);

  return Number.isInteger(id) && id > 0 ? id : undefined;
}

// After an interactive deploy, offers to point the deployed channel at the new
// hostname, then to move checkout onto the same domain.
//
// Asked once per channel: declining the site URL is saved in project.json.
// Declining the checkout URL isn't, because the site URL prompt that leads to
// it won't come back either; the merchant is warned instead.
export async function offerChannelUrlUpdates(options: DeployChannelUrlOptions): Promise<void> {
  const { storeHash, accessToken, apiHost, projectUuid, config, channelId } = options;

  // No channel means nothing to key the opt-out on, and scripted deploys keep
  // the flag-only behaviour.
  if (!process.stdin.isTTY || channelId === undefined) return;

  const declined = config.get('declinedSiteUrlChannels') ?? [];

  if (declined.includes(channelId)) return;

  const [site, projects] = await Promise.all([
    getChannelSite(channelId, storeHash, accessToken, apiHost),
    fetchProjects(storeHash, accessToken, apiHost),
  ]);
  const deploymentHostnames =
    projects.find((project) => project.uuid === projectUuid)?.deployment_hostnames ?? [];
  const storefrontUrl = (findChannelSiteUrl(site, 'primary') ?? site.url).replace(/\/$/, '');

  // Already pointed at this project; nothing to offer.
  if (deploymentHostnames.some((deployed) => storefrontUrl === `https://${deployed}`)) return;

  const shouldUpdate = await confirm({
    message: `Channel ${channelId}'s site URL is ${storefrontUrl}. Point it at this deployment?`,
    default: true,
  });

  if (!shouldUpdate) {
    config.set('declinedSiteUrlChannels', [...declined, channelId]);
    consola.info(
      `Won't ask again for channel ${channelId}. To change it later, run ` +
        `\`catalyst channels update --channel-id ${channelId}\`.`,
    );

    return;
  }

  const { hostname } = await runChannelSiteUrlFlow({
    storeHash,
    accessToken,
    apiHost,
    projectUuid,
    // The channel the build targets; asking again would only invite a mismatch.
    channelId,
    preferHostname: options.deploymentHostname,
    diagnoseCheckout: false,
  });

  const updated = await getChannelSite(channelId, storeHash, accessToken, apiHost);

  if (!isCrossDomainCheckout(updated)) return;

  // Off the managed zone, the checkout hostname is the merchant's to set up;
  // the diagnostic explains how.
  if (!isManagedHostingHostname(hostname)) {
    warnOnCrossDomainCheckout(updated);

    return;
  }

  const shouldMatchCheckout = await confirm({
    message:
      `Checkout is still on ${findChannelSiteUrl(updated, 'checkout') ?? 'another domain'}. ` +
      `Move it to https://${MANAGED_ZONE_CHECKOUT_PREFIX}${hostname} so shoppers stay on this ` +
      'domain through payment?',
    default: true,
  });

  if (!shouldMatchCheckout) {
    warnOnCrossDomainCheckout(updated);

    return;
  }

  await runChannelCheckoutUrlFlow({
    storeHash,
    accessToken,
    apiHost,
    channelId,
    storefrontHostname: hostname,
  });
}
