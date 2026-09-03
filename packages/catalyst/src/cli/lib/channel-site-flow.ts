import { select } from '@inquirer/prompts';

import { type Channel, fetchAvailableChannels, updateChannelSiteUrl } from './channels';
import { selectOrCreateInfrastructureProject } from './commerce-hosting';
import { consola } from './logger';
import { fetchProjects, type ProjectListItem } from './project';

export interface ChannelSiteFlowOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  // Linked project UUID (from --project-uuid or .bigcommerce/project.json). When
  // present and resolvable, skips the project picker; otherwise falls back to
  // `selectOrCreateInfrastructureProject`, which may throw NoLinkedProjectError
  // (caller decides how to surface it).
  projectUuid?: string;
  // Non-interactive overrides. When supplied, the corresponding prompt is
  // skipped.
  channelId?: number;
  hostname?: string;
  // When set, this hostname is pre-selected in the hostname prompt. Used by
  // `catalyst deploy --update-site-url` to default to the freshly-deployed
  // hostname.
  preferHostname?: string;
}

async function resolveProject(options: ChannelSiteFlowOptions): Promise<ProjectListItem> {
  const api = {
    storeHash: options.storeHash,
    accessToken: options.accessToken,
    apiHost: options.apiHost,
  };

  if (options.projectUuid) {
    const projects = await fetchProjects(api.storeHash, api.accessToken, api.apiHost);
    const matched = projects.find((p) => p.uuid === options.projectUuid);

    if (matched) return matched;

    consola.warn(
      `Project ${options.projectUuid} not found on this store. Pick another to continue.`,
    );
  }

  return selectOrCreateInfrastructureProject(api, options.projectUuid);
}

// Exported so `catalyst channels checkout-url` resolves channels the same way
// rather than re-deriving the Catalyst-platform filter and its error copy.
export async function resolveChannel(options: {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  channelId?: number;
}): Promise<{ id: number; name?: string }> {
  if (options.channelId !== undefined) {
    return { id: options.channelId };
  }

  consola.start('Fetching channels...');

  const channels = await fetchAvailableChannels(
    options.storeHash,
    options.accessToken,
    options.apiHost,
  );

  consola.success('Channels fetched.');

  // Only Catalyst-platform channels can meaningfully be pointed at a Catalyst
  // deployment hostname; other storefront platforms (Stencil, etc.) are
  // filtered out so the picker stays focused.
  const catalystChannels = channels.filter((c: Channel) => c.platform === 'catalyst');

  if (catalystChannels.length === 0) {
    throw new Error(
      'No Catalyst channels found on this store. Create one with `catalyst create` and try again.',
    );
  }

  const id = await select({
    message: 'Select the channel to update.',
    choices: catalystChannels.map((c: Channel) => ({
      name: c.name,
      value: c.id,
      description: `id: ${c.id}`,
    })),
  });

  const matched = catalystChannels.find((c) => c.id === id);

  return { id, name: matched?.name };
}

async function resolveHostname(
  project: ProjectListItem,
  options: ChannelSiteFlowOptions,
): Promise<string> {
  if (options.hostname) {
    return options.hostname;
  }

  if (project.deployment_hostnames.length === 0) {
    throw new Error(
      `Project "${project.name}" has no deployment hostnames yet. Run \`catalyst deploy\` first to create one.`,
    );
  }

  // When the caller knows which hostname they want surfaced first (e.g. the
  // freshly-deployed one from `catalyst deploy --update-site-url`), order it to
  // the top of the list so it's the default selection.
  const ordered = options.preferHostname
    ? [
        ...project.deployment_hostnames.filter((h) => h === options.preferHostname),
        ...project.deployment_hostnames.filter((h) => h !== options.preferHostname),
      ]
    : project.deployment_hostnames;

  const selected = await select({
    message: 'Select the hostname to point the channel at.',
    choices: ordered.map((h) => ({ name: h, value: h })),
  });

  return selected;
}

export async function runChannelSiteUrlFlow(options: ChannelSiteFlowOptions): Promise<void> {
  const project = await resolveProject(options);
  const channel = await resolveChannel(options);
  const hostname = await resolveHostname(project, options);
  const siteUrl = hostname.startsWith('https://') ? hostname : `https://${hostname}`;

  await updateChannelSiteUrl(
    channel.id,
    siteUrl,
    options.storeHash,
    options.accessToken,
    options.apiHost,
  );

  const channelLabel = channel.name ? `"${channel.name}" (${channel.id})` : String(channel.id);

  consola.success(`Updated channel ${channelLabel} site URL to ${siteUrl}.`);
}
