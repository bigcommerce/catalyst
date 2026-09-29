import { confirm } from '@inquirer/prompts';

import { canPrompt } from './can-prompt';
import { offerManagedCheckoutUrl } from './channel-checkout-url-flow';
import { runChannelSiteUrlFlow } from './channel-site-flow';
import { findChannelSiteUrl, getChannelSite } from './channels';
import { isManagedHostingHostname } from './checkout-url';
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

// The channel a deployment serves. Deployment secrets win, as in OpenNext's
// runtime; env files are the fallback (not loaded with `--prebuilt`).
export function deployedChannelId(secrets: DeploymentSecret[]): number | undefined {
  const raw =
    secrets.find((secret) => secret.key === 'BIGCOMMERCE_CHANNEL_ID')?.value ??
    process.env.BIGCOMMERCE_CHANNEL_ID;
  const id = Number(raw);

  return Number.isInteger(id) && id > 0 ? id : undefined;
}

// After an interactive deploy, offers to point the channel at the deployment
// and to move its checkout onto the same domain. Each is checked on every
// deploy; a decline is saved per channel.
export async function offerChannelUrlUpdates(options: DeployChannelUrlOptions): Promise<void> {
  const { storeHash, accessToken, apiHost, projectUuid, config, channelId } = options;

  // No channel means nothing to key the opt-outs on.
  if (!canPrompt() || channelId === undefined) return;

  const [site, projects] = await Promise.all([
    getChannelSite(channelId, storeHash, accessToken, apiHost),
    fetchProjects(storeHash, accessToken, apiHost),
  ]);
  const deploymentHostnames =
    projects.find((project) => project.uuid === projectUuid)?.deployment_hostnames ?? [];
  const storefrontUrl = (findChannelSiteUrl(site, 'primary') ?? site.url).replace(/\/$/, '');

  let storefrontHostname = deploymentHostnames.find(
    (deployed) => storefrontUrl === `https://${deployed}`,
  );

  storefrontHostname ??= await offerSiteUrl({ ...options, channelId }, storefrontUrl);

  // Not on this project, so a `c.` hostname under it wouldn't match.
  if (storefrontHostname === undefined) return;

  await offerManagedCheckoutUrl({
    storeHash,
    accessToken,
    apiHost,
    channelId,
    storefrontHostname,
    config,
    respectOptOut: true,
    defaultAnswer: false,
  });
}

// Resolves the hostname the site URL was set to, or undefined when it wasn't.
async function offerSiteUrl(
  options: DeployChannelUrlOptions & { channelId: number },
  storefrontUrl: string,
): Promise<string | undefined> {
  const { storeHash, accessToken, apiHost, projectUuid, config, channelId } = options;
  const declined = config.get('declinedSiteUrlChannels') ?? [];

  if (declined.includes(channelId)) return undefined;

  const shouldUpdate = await confirm({
    message: `Channel ${channelId}'s site URL is ${storefrontUrl}. Point it at this deployment?`,
    // Unasked-for after a deploy, so Enter mustn't change a live channel.
    default: false,
  });

  if (!shouldUpdate) {
    config.set('declinedSiteUrlChannels', [...declined, channelId]);
    consola.info(
      `Won't ask again for channel ${channelId}. To change it later, run ` +
        `\`catalyst channels update --channel-id ${channelId}\`.`,
    );

    return undefined;
  }

  const { hostname } = await runChannelSiteUrlFlow({
    storeHash,
    accessToken,
    apiHost,
    projectUuid,
    // The deploy knows both; the hostname picker only shows if it reported none.
    channelId,
    hostname: options.deploymentHostname,
    // On the managed zone the checkout offer follows; elsewhere, warn instead.
    diagnoseCheckout: !isManagedHostingHostname(options.deploymentHostname ?? ''),
  });

  return hostname;
}
