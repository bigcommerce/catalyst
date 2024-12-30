import { Command, Option } from '@commander-js/extra-typings';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';

import { CliApi } from '../utils/cli-api';
import { cloneCatalyst } from '../utils/clone-catalyst';
import { Https } from '../utils/https';
import { installDependencies } from '../utils/install-dependencies';
import { login, storeCredentials } from '../utils/login';
import { Telemetry } from '../utils/telemetry/telemetry';
import { writeEnv } from '../utils/write-env';

interface Channel {
  id: number;
  name: string;
  platform: string;
}

interface ChannelsResponse {
  data: Channel[];
}

interface InitResponse {
  data: {
    makeswift_dev_api_key: string;
    storefront_api_token: string;
    envVars: Record<string, string>;
  };
}

interface CreateChannelResponse {
  data: {
    id: number;
    storefront_api_token: string;
    envVars: Record<string, string>;
  };
}

interface EligibilityResponse {
  data: {
    eligible: boolean;
    message: string;
  };
}

function getPlatformCheckCommand(command: string): string {
  const isWindows = process.platform === 'win32';

  return isWindows ? `where.exe ${command}` : `which ${command}`;
}

const telemetry = new Telemetry();

async function handleChannelCreation(cliApi: CliApi) {
  const newChannelName = await input({
    message: 'What would you like to name your new channel?',
  });

  const shouldInstallSampleData = await select({
    message: 'Would you like to install sample data?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });

  const response = await cliApi.createChannel(newChannelName, shouldInstallSampleData);

  if (!response.ok) {
    console.error(
      chalk.red(`\nPOST /channels/catalyst failed: ${response.status} ${response.statusText}\n`),
    );
    process.exit(1);
  }

  const channelData: unknown = await response.json();

  if (!isCreateChannelResponse(channelData)) {
    console.error(chalk.red('\nUnexpected response format from create channel endpoint\n'));
    process.exit(1);
  }

  return {
    channelId: channelData.data.id,
    storefrontToken: channelData.data.storefront_api_token,
    envVars: channelData.data.envVars,
  };
}

async function handleChannelSelection(bc: Https) {
  const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];
  const channelsResponse = await bc.fetch('/v3/channels?available=true&type=storefront');

  if (!channelsResponse.ok) {
    console.error(
      chalk.red(
        `\nGET /v3/channels failed: ${channelsResponse.status} ${channelsResponse.statusText}\n`,
      ),
    );
    process.exit(1);
  }

  const availableChannels: unknown = await channelsResponse.json();

  if (!isChannelsResponse(availableChannels)) {
    console.error(chalk.red('\nUnexpected response format from channels endpoint\n'));
    process.exit(1);
  }

  const existingChannel = await select({
    message: 'Which channel would you like to use?',
    choices: availableChannels.data
      .sort(
        (a: Channel, b: Channel) =>
          channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform),
      )
      .map((ch: Channel) => ({
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

async function getChannelInit(cliApi: CliApi, channelId: number) {
  const initResponse = await cliApi.getChannelInit(channelId);

  if (!initResponse.ok) {
    console.error(
      chalk.red(
        `\nGET /channels/${channelId}/init failed: ${initResponse.status} ${initResponse.statusText}\n`,
      ),
    );
    process.exit(1);
  }

  const initData: unknown = await initResponse.json();

  if (!isInitResponse(initData)) {
    console.error(chalk.red('\nUnexpected response format from init endpoint\n'));
    process.exit(1);
  }

  return {
    storefrontToken: initData.data.storefront_api_token,
    envVars: initData.data.envVars,
  };
}

async function setupProject(options: {
  projectName?: string;
  projectDir: string;
}): Promise<{ projectName: string; projectDir: string }> {
  let { projectName, projectDir } = options;

  if (!pathExistsSync(projectDir)) {
    console.error(chalk.red(`Error: --projectDir ${projectDir} is not a valid path\n`));
    process.exit(1);
  }

  if (projectName) {
    projectName = kebabCase(projectName);
    projectDir = join(options.projectDir, projectName);

    if (pathExistsSync(projectDir)) {
      console.error(chalk.red(`Error: ${projectDir} already exists\n`));
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
      message: 'What is the name of your project?',
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
    console.error(chalk.red('Error: git is required to create a Catalyst project\n'));
    process.exit(1);
  }

  try {
    execSync(getPlatformCheckCommand('pnpm'), { stdio: 'ignore' });
  } catch {
    console.error(chalk.red('Error: pnpm is required to create a Catalyst project\n'));
    console.error(chalk.yellow('Tip: Enable it by running `corepack enable pnpm`\n'));
    process.exit(1);
  }
}

export const create = new Command('create')
  .description('Command to scaffold and connect a Catalyst storefront to your BigCommerce store')
  .option('--project-name <name>', 'Name of your Catalyst project')
  .option('--project-dir <dir>', 'Directory in which to create your project', process.cwd())
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'BigCommerce channel ID')
  .option('--storefront-token <token>', 'BigCommerce storefront token')
  .option('--gh-ref <ref>', 'Clone a specific ref from the source repository')
  .option('--reset-main', 'Reset the main branch to the gh-ref')
  .option('--repository <repository>', 'GitHub repository to clone from', 'bigcommerce/catalyst')
  .option('--env <vars...>', 'Arbitrary environment variables to set in .env.local')
  .addOption(
    new Option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
      .default('bigcommerce.com')
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

    checkRequiredTools();

    const { projectName, projectDir } = await setupProject({
      projectName: options.projectName,
      projectDir: options.projectDir,
    });

    let storeHash = options.storeHash;
    let accessToken = options.accessToken;
    let channelId;
    let storefrontToken = options.storefrontToken;
    let credentials;

    if (options.channelId) {
      channelId = parseInt(options.channelId, 10);
    }

    let envVars: Record<string, string> = {};

    // Get credentials if needed
    if ((!storeHash || !accessToken) && (!channelId || !storefrontToken)) {
      credentials = await login(`https://login.${options.bigcommerceHostname}`);
      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    // If store hash, channel ID, and storefront token are all provided, skip channel selection/creation
    if (storeHash && channelId && storefrontToken) {
      envVars.BIGCOMMERCE_STORE_HASH = storeHash;
      envVars.BIGCOMMERCE_CHANNEL_ID = channelId.toString();
      envVars.BIGCOMMERCE_STOREFRONT_API_TOKEN = storefrontToken;
    } else {
      if (!storeHash || !accessToken) {
        // Create project without credentials
        console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);
        cloneCatalyst({ repository, projectName, projectDir, ghRef, resetMain: options.resetMain });
        await installDependencies(projectDir);

        // Add any CLI-provided env vars
        if (options.env) {
          const cliEnvVars = options.env.reduce<Record<string, string>>((acc, env) => {
            const [key, value] = env.split('=');

            if (key && value) {
              acc[key] = value;
            }

            return acc;
          }, {});

          Object.assign(envVars, cliEnvVars);
        }

        // Write env vars even if we don't have store credentials
        writeEnv(projectDir, envVars);

        console.log(
          [
            `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
            `Next steps:`,
            Object.keys(envVars).length > 0
              ? chalk.yellow(`\n- cd ${projectName} && pnpm run dev\n`)
              : [
                  chalk.yellow(`\n- cd ${projectName} && cp .env.example .env.local`),
                  chalk.yellow(`\n- Populate .env.local with your BigCommerce API credentials\n`),
                ].join(''),
          ].join('\n'),
        );

        process.exit(0);
      }

      // At this point we should have a storeHash and can identify the account
      await telemetry.identify(storeHash);

      if (!channelId || !storefrontToken) {
        const bc = new Https({
          baseUrl: `https://api.${options.bigcommerceHostname}/stores/${storeHash}`,
          accessToken,
        });

        const cliApi = new CliApi({
          origin: options.cliApiOrigin,
          storeHash,
          accessToken,
        });

        // If we have channelId but no storefrontToken, just get the init data
        if (channelId && !storefrontToken) {
          const initData = await getChannelInit(cliApi, channelId);

          envVars = { ...initData.envVars };
          storefrontToken = initData.storefrontToken;
        } else if (!channelId) {
          const eligibilityResponse = await cliApi.checkEligibility();

          if (!eligibilityResponse.ok) {
            console.error(
              chalk.red(
                `\nGET /channels/catalyst/eligibility failed: ${eligibilityResponse.status} ${eligibilityResponse.statusText}\n`,
              ),
            );
            process.exit(1);
          }

          const eligibilityData: unknown = await eligibilityResponse.json();

          if (!isEligibilityResponse(eligibilityData)) {
            console.error(chalk.red('\nUnexpected response format from eligibility endpoint\n'));
            process.exit(1);
          }

          if (!eligibilityData.data.eligible) {
            console.warn(chalk.yellow(eligibilityData.data.message));
          }

          let shouldCreateChannel;

          if (eligibilityData.data.eligible) {
            shouldCreateChannel = await select({
              message: 'Would you like to create a new channel?',
              choices: [
                { name: 'Yes', value: true },
                { name: 'No', value: false },
              ],
            });
          }

          if (shouldCreateChannel) {
            const channelData = await handleChannelCreation(cliApi);

            channelId = channelData.channelId;
            storefrontToken = channelData.storefrontToken;
            envVars = { ...channelData.envVars };

            console.log(chalk.green(`Channel created successfully`));
          }

          if (!shouldCreateChannel) {
            channelId = await handleChannelSelection(bc);

            const initData = await getChannelInit(cliApi, channelId);

            envVars = { ...initData.envVars };
            storefrontToken = initData.storefrontToken;
          }
        }
      }
    }

    // Add any CLI-provided env vars as overrides
    if (options.env) {
      const cliEnvVars = options.env.reduce<Record<string, string>>((acc, env) => {
        const [key, value] = env.split('=');

        if (key && value) {
          acc[key] = value;
        }

        return acc;
      }, {});

      Object.assign(envVars, cliEnvVars);
    }

    // Add store hash, channel ID, and storefront token to envVars if provided
    if (options.storeHash) {
      envVars.BIGCOMMERCE_STORE_HASH = options.storeHash;
    }

    if (options.channelId) {
      envVars.BIGCOMMERCE_CHANNEL_ID = options.channelId;
    }

    if (options.storefrontToken) {
      envVars.BIGCOMMERCE_STOREFRONT_TOKEN = options.storefrontToken;
    }

    if (!channelId) throw new Error('Something went wrong, channelId is not defined');
    if (!storefrontToken) throw new Error('Something went wrong, storefrontToken is not defined');

    // Create the project with all necessary configuration
    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);
    cloneCatalyst({ repository, projectName, projectDir, ghRef, resetMain: options.resetMain });
    await installDependencies(projectDir);

    // Write env vars
    writeEnv(projectDir, envVars);

    // Store credentials after successful project creation
    if (credentials) {
      storeCredentials(projectDir, credentials);
    }

    console.log(
      `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
      '\nNext steps:\n',
      chalk.yellow(`\ncd ${projectName} && pnpm run dev\n`),
    );
  });

function isInitResponse(response: unknown): response is InitResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'storefront_api_token' in response.data &&
    'envVars' in response.data
  );
}

function isEligibilityResponse(response: unknown): response is EligibilityResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'eligible' in response.data &&
    'message' in response.data
  );
}

function isCreateChannelResponse(response: unknown): response is CreateChannelResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'id' in response.data &&
    'storefront_api_token' in response.data &&
    'envVars' in response.data
  );
}

function isChannelsResponse(response: unknown): response is ChannelsResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray(response.data) &&
    response.data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'name' in item &&
        'platform' in item,
    )
  );
}
