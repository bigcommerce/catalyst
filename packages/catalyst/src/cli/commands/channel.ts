import { Command, InvalidArgumentError, Option } from 'commander';
import type Conf from 'conf';
import { colorize } from 'consola/utils';
import { outputFileSync } from 'fs-extra/esm';
import { join } from 'node:path';

import { runChannelSiteUrlFlow } from '../lib/channel-site-flow';
import { fetchAvailableChannels, getChannelInit } from '../lib/channels';
import { NoLinkedProjectError } from '../lib/commerce-hosting';
import { parseEnvAssignment } from '../lib/env-config';
import { consola } from '../lib/logger';
import { LoginAbortedError, login as runInteractiveLogin } from '../lib/login';
import { getProjectConfig, type ProjectConfigSchema } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  loginUrlOption,
  projectUuidOption,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

// Surface Catalyst channels first, then Next, then Stencil (`bigcommerce`),
// then anything else — same ordering `catalyst create` uses.
const CHANNEL_SORT_ORDER = ['catalyst', 'next', 'bigcommerce'];

const platformLabel = (platform: string) =>
  platform === 'bigcommerce' ? 'Stencil' : platform.charAt(0).toUpperCase() + platform.slice(1);

const parseChannelId = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError(`"${value}" is not a valid channel ID (expected a number).`);
  }

  return parsed;
};

// Resolve credentials from flags/env → persisted project config → interactive
// login (persisting on success). Returns null when the user aborts login.
// `channel connect` is an onboarding command — a fresh clone has neither
// .env.local nor .bigcommerce/project.json — so it logs the user in like
// `catalyst project create`, rather than erroring like the operational commands.
async function resolveCredentialsWithLogin(
  options: { storeHash?: string; accessToken?: string; loginUrl: string; apiHost: string },
  config: Conf<ProjectConfigSchema>,
): Promise<{ storeHash: string; accessToken: string } | null> {
  const storeHash = options.storeHash ?? config.get('storeHash');
  const accessToken = options.accessToken ?? config.get('accessToken');

  if (storeHash && accessToken) {
    return { storeHash, accessToken };
  }

  try {
    const credentials = await runInteractiveLogin(options.loginUrl, options.apiHost);

    config.set('storeHash', credentials.storeHash);
    config.set('accessToken', credentials.accessToken);

    return credentials;
  } catch (error) {
    if (error instanceof LoginAbortedError) {
      return null;
    }

    throw error;
  }
}

const update = new Command('update')
  .configureHelp({ showGlobalOptions: true })
  .description(
    "Update a BigCommerce channel's site URL to point at one of your project's deployment hostnames.",
  )
  .addHelpText(
    'after',
    `
Examples:
  # Pick a channel and hostname interactively
  $ catalyst channel update

  # Skip both prompts
  $ catalyst channel update --channel-id 123 --hostname my-storefront.example.com`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .addOption(
    new Option(
      '--channel-id <id>',
      'Skip the channel prompt and target this channel directly.',
    ).argParser((value: string) => Number(value)),
  )
  .addOption(
    new Option(
      '--hostname <hostname>',
      "Skip the hostname prompt and use this hostname directly. Must be one of the project's deployment_hostnames.",
    ),
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    try {
      await runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost: options.apiHost,
        projectUuid: options.projectUuid ?? config.get('projectUuid'),
        channelId: options.channelId,
        hostname: options.hostname,
      });
    } catch (error) {
      if (error instanceof NoLinkedProjectError) {
        consola.info(
          "When you're ready to create a project, run `catalyst project create` or re-run `catalyst channel update`.",
        );
        process.exit(0);

        // Unreachable in production; prevents continuation when process.exit is mocked in tests.
        return;
      }

      throw error;
    }

    process.exit(0);
  });

const connect = new Command('connect')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Connect this Catalyst project to a BigCommerce channel and write its credentials to .env.local.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Pick a channel interactively (logs you in if needed)
  $ catalyst channel connect

  # Non-interactive
  $ catalyst channel connect --store-hash <hash> --access-token <token> --channel-id 123

  # Append extra environment variables to .env.local
  $ catalyst channel connect --channel-id 123 --env MY_FLAG=1`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(loginUrlOption())
  .addOption(
    new Option(
      '--channel-id <id>',
      'Connect this channel directly, skipping the picker.',
    ).argParser(parseChannelId),
  )
  .option(
    '--env <vars...>',
    'Arbitrary environment variables to set in .env.local. Format: KEY=VALUE (repeatable).',
  )
  .addOption(
    new Option('--cli-api-origin <origin>', 'Catalyst CLI API origin')
      .default('https://cxm-prd.bigcommerceapp.com')
      .hideHelp(),
  )
  .action(async (options) => {
    const config = getProjectConfig();

    const credentials = await resolveCredentialsWithLogin(options, config);

    if (!credentials) {
      consola.info(
        'Login aborted. Re-run `catalyst channel connect` when you have your credentials ready.',
      );
      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = credentials;

    await getTelemetry().identify(storeHash);

    let channelId = options.channelId;
    let channelName: string | undefined;

    if (channelId === undefined) {
      const channels = await fetchAvailableChannels(storeHash, accessToken, options.apiHost);

      if (channels.length === 0) {
        consola.info(
          'No storefront channels found on this store. Create one with `catalyst create` and try again.',
        );
        process.exit(0);

        return;
      }

      const sorted = [...channels].sort((a, b) => {
        const aIndex = CHANNEL_SORT_ORDER.indexOf(a.platform);
        const bIndex = CHANNEL_SORT_ORDER.indexOf(b.platform);

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
      });

      const selected = await consola.prompt('Which channel would you like to connect?', {
        type: 'select',
        options: sorted.map((c) => ({
          label: c.name,
          value: String(c.id),
          hint: platformLabel(c.platform),
        })),
        cancel: 'reject',
      });

      channelId = Number(selected);
      channelName = channels.find((c) => c.id === channelId)?.name;
    }

    const initData = await getChannelInit(channelId, storeHash, accessToken, options.cliApiOrigin);

    const envVars: Record<string, string> = { ...initData.envVars };

    // Inline `--env KEY=VALUE` overrides win over the channel-provided values.
    if (options.env) {
      options.env.forEach((entry) => {
        const { key, value } = parseEnvAssignment(entry);

        envVars[key] = value;
      });
    }

    // Writes .env.local in the current working directory — `channel connect`
    // runs from inside `core/`, the same place `dev`/`build`/`deploy` run.
    outputFileSync(
      join(process.cwd(), '.env.local'),
      `${Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')}\n`,
    );

    const label = channelName ? `channel "${channelName}" (${channelId})` : `channel ${channelId}`;

    consola.success(`Connected ${label} — wrote .env.local.`);
    consola.info('Next steps:');
    consola.info(colorize('yellow', '  pnpm run dev'));

    process.exit(0);
  });

export const channel = new Command('channel')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage BigCommerce channels.')
  .addCommand(connect)
  .addCommand(update);
