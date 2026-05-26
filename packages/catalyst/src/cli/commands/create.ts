import { Command, InvalidArgumentError, Option } from '@commander-js/extra-typings';
import { input, select } from '@inquirer/prompts';
import { execSync } from 'child_process';
import { colorize } from 'consola/utils';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';

import { DEFAULT_LOGIN_URL } from '../lib/auth';
import { buildWorkspacePackages } from '../lib/build-workspace-packages';
import {
  checkChannelEligibility,
  createChannel,
  fetchAvailableChannels,
  getChannelInit,
} from '../lib/channels';
import { cloneCatalyst } from '../lib/clone-catalyst';
import { promptForCommerceHostingProject, setupCommerceHosting } from '../lib/commerce-hosting';
import { installDependencies } from '../lib/install-dependencies';
import { getAvailableLocales } from '../lib/localization';
import { consola } from '../lib/logger';
import { login, LoginAbortedError } from '../lib/login';
import { hasProjectsAccess, type ProjectListItem } from '../lib/project';
import { setupCoreProject } from '../lib/setup-core-project';
import { accessTokenOption, storeHashOption } from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';
import { writeEnv } from '../lib/write-env';

function getPlatformCheckCommand(command: string): string {
  const isWindows = process.platform === 'win32';

  return isWindows ? `where.exe ${command}` : `which ${command}`;
}

function parseChannelId(value: string): number {
  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError(`"${value}" is not a valid channel ID (expected a number).`);
  }

  return parsed;
}

// Variadic argParser: called once per `--env KEY=VALUE`, accumulating into a
// merged record. Splits on the first `=` so values containing `=` are preserved.
function parseEnvFlag(
  value: string,
  previous: Record<string, string> = {},
): Record<string, string> {
  const eqIdx = value.indexOf('=');

  if (eqIdx <= 0) {
    throw new InvalidArgumentError(`Expected KEY=VALUE, got "${value}".`);
  }

  const key = value.substring(0, eqIdx);
  const val = value.substring(eqIdx + 1);

  if (!val) {
    throw new InvalidArgumentError(`Expected KEY=VALUE with non-empty value, got "${value}".`);
  }

  return { ...previous, [key]: val };
}

async function handleChannelCreation(
  storeHash: string,
  accessToken: string,
  apiHost: string,
  cliApiOrigin: string,
) {
  const newChannelName = await input({
    message: 'What would you like to name your new channel?',
  });

  const availableLocales = await getAvailableLocales(storeHash, accessToken, apiHost);

  const storefrontLocale = await select({
    message: 'Which default language would you like to set for your channel?',
    default: 'en',
    choices: availableLocales,
    theme: {
      style: {
        help: () => colorize('dim', '(Select locale from the list or start typing the name)'),
      },
    },
  });

  const shouldAddAdditionalLocales = await select({
    message: 'Would you like to add additional languages?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });

  let additionalLocales: string[] = [];

  if (shouldAddAdditionalLocales) {
    const localeOptions = availableLocales
      .filter(({ value }) => value !== storefrontLocale)
      .map(({ name, value }) => ({ label: name, value, hint: value }));

    // consola's multiselect returns the value strings at runtime, but its typed
    // return is loose (the whole option array). Recursion + cast avoids the
    // no-await-in-loop / no-constant-condition lint hits and re-prompts on overflow.
    const pickLocales = async (): Promise<string[]> => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const selected = (await consola.prompt(
        'Which additional languages would you like to add to your channel?',
        { type: 'multiselect', options: localeOptions, cancel: 'reject' },
      )) as unknown as string[];

      if (selected.length > 4) {
        consola.warn('You can only select up to 4 additional languages. Please try again.');

        return pickLocales();
      }

      return selected;
    };

    additionalLocales = await pickLocales();
  }

  const shouldInstallSampleData = await select({
    message: 'Would you like to install sample data?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });

  return createChannel(
    newChannelName,
    storefrontLocale,
    additionalLocales,
    shouldInstallSampleData,
    storeHash,
    accessToken,
    cliApiOrigin,
  );
}

async function handleChannelSelection(storeHash: string, accessToken: string, apiHost: string) {
  const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];
  const channels = await fetchAvailableChannels(storeHash, accessToken, apiHost);

  const existingChannel = await select({
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

  return existingChannel.id;
}

async function setupProject(options: {
  projectName?: string;
  projectDir: string;
}): Promise<{ projectName: string; projectDir: string }> {
  let { projectName, projectDir } = options;

  if (!pathExistsSync(projectDir)) {
    consola.error(`--project-dir ${projectDir} is not a valid path`);
    process.exit(1);
  }

  if (projectName) {
    projectName = kebabCase(projectName);
    projectDir = join(options.projectDir, projectName);

    if (pathExistsSync(projectDir)) {
      consola.error(`${projectDir} already exists`);
      process.exit(1);
    }
  }

  if (!projectName) {
    const validateProjectName = (i: string) => {
      const formatted = kebabCase(i);

      if (!formatted) return 'Project name is required';

      const targetDir = join(options.projectDir, formatted);

      if (pathExistsSync(targetDir)) return `Destination '${targetDir}' already exists`;

      projectName = formatted;
      projectDir = targetDir;

      return true;
    };

    await input({
      message: 'What do you want to name your project directory?',
      default: 'my-catalyst-app',
      validate: validateProjectName,
    });
  }

  if (!projectName) throw new Error('Something went wrong, projectName is not defined');
  if (!projectDir) throw new Error('Something went wrong, projectDir is not defined');

  return { projectName, projectDir };
}

function checkRequiredTools() {
  try {
    execSync(getPlatformCheckCommand('git'), { stdio: 'ignore' });
  } catch {
    consola.error('git is required to create a Catalyst project');
    process.exit(1);
  }

  try {
    execSync(getPlatformCheckCommand('pnpm'), { stdio: 'ignore' });
  } catch {
    consola.error(
      'pnpm is required to create a Catalyst project. Enable it by running `corepack enable pnpm`.',
    );
    process.exit(1);
  }
}

export const create = new Command('create')
  .configureHelp({ showGlobalOptions: true })
  .description('Scaffold and connect a Catalyst storefront to your BigCommerce store.')
  .addHelpText(
    'after',
    `
Examples:
  # Interactive scaffold (default — self-hosted, no hosting prompt)
  $ catalyst create

  # Non-interactive: skip the project-name prompt
  $ catalyst create --project-name my-store

  # Eagerly set up Commerce Hosting at create time
  $ catalyst create --project-name my-store --hosting commerce`,
  )
  .option('--project-name <name>', 'Name of your Catalyst project')
  .option('--project-dir <dir>', 'Directory in which to create your project', process.cwd())
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .option('--channel-id <id>', 'BigCommerce channel ID', parseChannelId)
  .option('--storefront-token <token>', 'BigCommerce storefront token')
  .option(
    '--gh-ref <ref>',
    'Clone a specific ref from the source repository',
    '@bigcommerce/catalyst-core@latest',
  )
  .option('--reset-main', 'Reset the main branch to the gh-ref')
  .option('--repository <repository>', 'GitHub repository to clone from', 'bigcommerce/catalyst')
  .option(
    '--env <vars...>',
    'Arbitrary environment variables to set in .env.local. Format: KEY=VALUE (repeatable).',
    parseEnvFlag,
  )
  .addOption(
    new Option(
      '--hosting <mode>',
      'Hosting mode: "self-hosted" (default) or "commerce" to set up Commerce Hosting at create time. When omitted, scaffolding is hosting-agnostic; run `catalyst deploy` later to opt in.',
    ).choices(['self-hosted', 'commerce'] as const),
  )
  .option(
    '--use-existing',
    'Only used with --hosting commerce and --project-name. When the named project already exists on the store, reuse it instead of prompting. Has no effect without --hosting commerce.',
  )
  .addOption(
    new Option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
      .default('bigcommerce.com')
      .hideHelp(),
  )
  .addOption(
    new Option('--login-url <url>', 'BigCommerce login URL.')
      .env('BIGCOMMERCE_LOGIN_URL')
      .default(DEFAULT_LOGIN_URL)
      .hideHelp(),
  )
  .addOption(
    new Option('--cli-api-origin <origin>', 'Catalyst CLI API origin')
      .default('https://cxm-prd.bigcommerceapp.com')
      .hideHelp(),
  )
  // eslint-disable-next-line complexity
  .action(async (options) => {
    const { ghRef, repository } = options;

    if (options.useExisting && options.hosting !== 'commerce') {
      consola.warn('--use-existing has no effect without --hosting commerce. Ignoring.');
    }

    checkRequiredTools();

    const { projectName, projectDir } = await setupProject({
      projectName: options.projectName,
      projectDir: options.projectDir,
    });

    let storeHash = options.storeHash;
    let accessToken = options.accessToken;
    let channelId = options.channelId;
    let storefrontToken = options.storefrontToken;

    let envVars: Record<string, string> = {};

    // Always require store creds. `--channel-id` + `--storefront-token` aren't
    // enough on their own — the storefront also needs BIGCOMMERCE_STORE_HASH at
    // runtime, and downstream catalyst commands (deploy, project, ...) need an
    // access token. Device login covers the missing pieces; the user picks the
    // store during the OAuth flow regardless of any partial flags they passed.
    if (!storeHash || !accessToken) {
      const apiHost = `api.${options.bigcommerceHostname}`;

      try {
        const credentials = await login(options.loginUrl, apiHost);

        storeHash = credentials.storeHash;
        accessToken = credentials.accessToken;
      } catch (error) {
        if (error instanceof LoginAbortedError) {
          consola.info(
            'Login aborted. Re-run `catalyst create` when you have your credentials ready.',
          );
          process.exit(0);

          return;
        }

        throw error;
      }
    }

    const useCommerceHosting = options.hosting === 'commerce';

    await getTelemetry().identify(storeHash);

    // Seed env vars from local state when all three were flag-provided. Channel
    // resolution below overwrites this wholesale via `envVars = { ...initData.envVars }`,
    // which is fine — that path means the user wanted us to fetch fresh values.
    if (storeHash && channelId && storefrontToken) {
      envVars.BIGCOMMERCE_STORE_HASH = storeHash;
      envVars.BIGCOMMERCE_CHANNEL_ID = channelId.toString();
      envVars.BIGCOMMERCE_STOREFRONT_TOKEN = storefrontToken;
    }

    // Resolve channel only when we have creds and are missing channel info.
    if (storeHash && accessToken && (!channelId || !storefrontToken)) {
      const apiHost = `api.${options.bigcommerceHostname}`;
      const cliApiOrigin = options.cliApiOrigin;

      if (channelId && !storefrontToken) {
        const initData = await getChannelInit(channelId, storeHash, accessToken, cliApiOrigin);

        envVars = { ...initData.envVars };
        storefrontToken = initData.storefrontToken;
      } else if (!channelId) {
        const eligibility = await checkChannelEligibility(storeHash, accessToken, cliApiOrigin);

        if (!eligibility.eligible) {
          consola.warn(eligibility.message);
        }

        let shouldCreateChannel;

        if (eligibility.eligible) {
          shouldCreateChannel = await select({
            message: 'Would you like to create a new channel?',
            choices: [
              { name: 'Yes', value: true },
              { name: 'No', value: false },
            ],
          });
        }

        if (shouldCreateChannel) {
          const channelData = await handleChannelCreation(
            storeHash,
            accessToken,
            apiHost,
            cliApiOrigin,
          );

          channelId = channelData.channelId;
          storefrontToken = channelData.storefrontToken;
          envVars = { ...channelData.envVars };

          consola.success('Channel created successfully.');
          consola.warn(
            'A preview storefront has been deployed in your BigCommerce control panel. This preview may look different from your local environment as it may be running different code. Additionally, it may take a few minutes for the channel storefront to be accessible.',
          );
        }

        if (!shouldCreateChannel) {
          channelId = await handleChannelSelection(storeHash, accessToken, apiHost);

          const initData = await getChannelInit(channelId, storeHash, accessToken, cliApiOrigin);

          envVars = { ...initData.envVars };
          storefrontToken = initData.storefrontToken;
        }
      }
    }

    if (options.env) {
      Object.assign(envVars, options.env);
    }

    if (options.storeHash) envVars.BIGCOMMERCE_STORE_HASH = options.storeHash;
    if (options.channelId) envVars.BIGCOMMERCE_CHANNEL_ID = options.channelId.toString();
    if (options.storefrontToken) envVars.BIGCOMMERCE_STOREFRONT_TOKEN = options.storefrontToken;

    if (useCommerceHosting && accessToken) {
      envVars.BIGCOMMERCE_ACCESS_TOKEN = accessToken;
    }

    // Pre-populate CATALYST_ACCESS_TOKEN so subsequent catalyst CLI commands
    // (`catalyst deploy`, `catalyst project ...`, etc.) work without re-auth.
    // CATALYST_STORE_HASH isn't written — the CLI falls back to BIGCOMMERCE_STORE_HASH
    // (already in envVars from the channel init response) at startup.
    if (accessToken) envVars.CATALYST_ACCESS_TOKEN = accessToken;

    // Resolve the Commerce Hosting project before cloning so credential checks
    // and prompts happen up-front. We defer the file mutations
    // (`setupCommerceHosting`) until after the clone.
    let commerceHostingProject: ProjectListItem | undefined;

    if (useCommerceHosting && storeHash && accessToken) {
      const apiHost = `api.${options.bigcommerceHostname}`;
      const hasAccess = await hasProjectsAccess(storeHash, accessToken, apiHost);

      if (!hasAccess) {
        consola.error(
          'This store does not have access to the Infrastructure Projects API. Contact support@bigcommerce.com to enable it.',
        );
        process.exit(1);
      }

      commerceHostingProject = await promptForCommerceHostingProject(
        { storeHash, accessToken, apiHost },
        projectName,
        !!options.projectName,
        options.useExisting,
      );
    }

    consola.info(`Creating '${projectName}' at '${projectDir}'`);

    // Anything that mutates `projectDir` runs inside this block. If a step
    // fails, the directory is likely partially populated — surface that to the
    // user so they can clean up before retrying. We don't auto-delete because
    // they may want to inspect the partial state first.
    try {
      cloneCatalyst({ repository, projectName, projectDir, ghRef, resetMain: options.resetMain });
      setupCoreProject(projectDir);

      if (useCommerceHosting && commerceHostingProject && storeHash && accessToken) {
        setupCommerceHosting({
          projectDir,
          projectUuid: commerceHostingProject.uuid,
          storeHash,
          accessToken,
        });
      }

      // Write env before install/build — keeps env vars available to any future
      // workspace build script that might read them, and matters today for
      // postinstall scripts that may resolve env-driven config.
      writeEnv(projectDir, envVars);

      await installDependencies(projectDir);
      buildWorkspacePackages(projectDir);
    } catch (error) {
      if (pathExistsSync(projectDir)) {
        consola.warn(
          `Setup failed before completion. '${projectDir}' may be in a partial state — review and delete it before re-running 'catalyst create'.`,
        );
      }

      throw error;
    }

    consola.success(`Created '${projectName}' at '${projectDir}'`);
    consola.info('Next steps:');
    consola.info(colorize('yellow', `  cd ${projectName}/core && pnpm run dev`));

    if (useCommerceHosting) {
      consola.info(
        colorize(
          'yellow',
          `  Run 'cd ${projectName}/core && pnpm run deploy' when ready to deploy to Commerce Hosting.`,
        ),
      );
    }
  });
