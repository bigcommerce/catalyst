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

// The channel a deployment serves. A deployment secret (project.json `env` or
// `--secret`) wins: at runtime OpenNext copies the worker's bindings onto
// `process.env` first and only fills unset keys from the env files baked in at
// build time. The env files are the fallback, and aren't loaded at all with
// `--prebuilt`.
export function deployedChannelId(secrets: DeploymentSecret[]): number | undefined {
  const raw =
    secrets.find((secret) => secret.key === 'BIGCOMMERCE_CHANNEL_ID')?.value ??
    process.env.BIGCOMMERCE_CHANNEL_ID;
  const id = Number(raw);

  return Number.isInteger(id) && id > 0 ? id : undefined;
}

// After an interactive deploy, offers to point the deployed channel at the new
// hostname, and to move its checkout onto the same domain. The two are checked
// separately on every deploy, so a checkout left behind is offered even when
// the site URL was set some other way, or earlier. Declining either is saved
// per channel in project.json, and that offer isn't made again.
export async function offerChannelUrlUpdates(options: DeployChannelUrlOptions): Promise<void> {
  const { storeHash, accessToken, apiHost, projectUuid, config, channelId } = options;

  // No channel means nothing to key the opt-outs on, and scripted deploys keep
  // the flag-only behaviour.
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

  // Not pointed at this project, so a checkout hostname under it wouldn't
  // share the storefront's domain.
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
    // Both are known: the channel the build targets and the hostname the deploy
    // went live on. The hostname picker only shows if the deploy didn't report
    // one.
    channelId,
    hostname: options.deploymentHostname,
    // The checkout offer that follows covers the managed zone; elsewhere the
    // diagnostic explains how to set up a checkout domain.
    diagnoseCheckout: !isManagedHostingHostname(options.deploymentHostname ?? ''),
  });

  return hostname;
}
