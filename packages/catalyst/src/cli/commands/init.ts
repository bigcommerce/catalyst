import { Command, Option } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import type Conf from 'conf';
import { colorize } from 'consola/utils';
import { outputFileSync } from 'fs-extra/esm';
import { join } from 'path';

import { fetchAvailableChannels, getChannelInit } from '../lib/channels';
import { parseEnvAssignment } from '../lib/env-config';
import { consola } from '../lib/logger';
import { login, LoginAbortedError, type LoginResult } from '../lib/login';
import { getProjectConfig, type ProjectConfigSchema } from '../lib/project-config';
import {
  accessTokenOption,
  apiHostOption,
  loginUrlOption,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

// Mirrors `catalyst create`'s channel ordering: surface Catalyst-platform
// channels first, then Next, then Stencil (`bigcommerce`), then anything else.
const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

// Writes .env.local in the current working directory. Unlike `catalyst create`
// — which scaffolds a sibling repo and targets `<projectDir>/core/.env.local` —
// `init` runs inside an existing project's `core/` directory (the same place
// `catalyst dev`/`build`/`deploy` run), so the file belongs in the cwd.
function writeEnvToCwd(envVars: Record<string, string>) {
  outputFileSync(
    join(process.cwd(), '.env.local'),
    `${Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')}\n`,
  );
}

// Resolves store credentials from flags/env, then the persisted project config,
// then an interactive login. Returns null when the user aborts the login so the
// caller can exit cleanly. Credentials obtained via login are persisted so
// subsequent catalyst commands (`deploy`, `project`, ...) don't re-prompt.
async function resolveStoreCredentials(
  options: { storeHash?: string; accessToken?: string; loginUrl: string; apiHost: string },
  config: Conf<ProjectConfigSchema>,
): Promise<LoginResult | null> {
  const storeHash = options.storeHash ?? config.get('storeHash');
  const accessToken = options.accessToken ?? config.get('accessToken');

  if (storeHash && accessToken) {
    return { storeHash, accessToken };
  }

  try {
    const credentials = await login(options.loginUrl, options.apiHost);

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

export const init = new Command('init')
  .configureHelp({ showGlobalOptions: true })
  .description('Connect a BigCommerce store and channel to an existing Catalyst project.')
  .addHelpText(
    'after',
    `
Examples:
  # Interactive: log in, then pick a channel to connect
  $ catalyst init

  # Non-interactive with existing credentials
  $ catalyst init --store-hash <STORE_HASH> --access-token <ACCESS_TOKEN>

  # Append extra environment variables to .env.local
  $ catalyst init --env MY_FLAG=1 --env OTHER=value`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(loginUrlOption())
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

    const credentials = await resolveStoreCredentials(options, config);

    if (!credentials) {
      consola.info('Login aborted. Re-run `catalyst init` when you have your credentials ready.');
      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = credentials;

    await getTelemetry().identify(storeHash);

    const channels = await fetchAvailableChannels(storeHash, accessToken, options.apiHost);

    const channel = await select({
      message: 'Which channel would you like to use?',
      choices: channels
        .sort((a, b) => {
          const aIndex = channelSortOrder.indexOf(a.platform);
          const bIndex = channelSortOrder.indexOf(b.platform);

          if (aIndex === -1 && bIndex === -1) {
            return 0;
          }

          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;

          return aIndex - bIndex;
        })
        .map((ch) => ({
          name: ch.name,
          value: ch,
          description: `Channel Platform: ${
            ch.platform === 'bigcommerce'
              ? 'Stencil'
              : ch.platform.charAt(0).toUpperCase() + ch.platform.slice(1)
          }`,
        })),
    });

    const initData = await getChannelInit(channel.id, storeHash, accessToken, options.cliApiOrigin);

    const envVars: Record<string, string> = { ...initData.envVars };

    // Inline `--env KEY=VALUE` overrides win over the channel-provided values.
    if (options.env) {
      options.env.forEach((entry) => {
        const { key, value } = parseEnvAssignment(entry);

        envVars[key] = value;
      });
    }

    writeEnvToCwd(envVars);

    consola.success(`.env.local file created for channel ${channel.name}!`);
    consola.info('Next steps:');
    consola.info(colorize('yellow', '  pnpm run dev'));
  });
