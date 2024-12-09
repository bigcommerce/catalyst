import { Command, Option } from '@commander-js/extra-typings';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';
import { z } from 'zod';

import { cloneCatalyst } from '../utils/clone-catalyst';
import { Https } from '../utils/https';
import { installDependencies } from '../utils/install-dependencies';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { Telemetry } from '../utils/telemetry/telemetry';
import { writeEnv } from '../utils/write-env';

function getPlatformCheckCommand(command: string): string {
  const isWindows = process.platform === 'win32';

  return isWindows ? `where.exe ${command}` : `which ${command}`;
}

const telemetry = new Telemetry();

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
    new Option('--sample-data-api-url <url>', 'BigCommerce sample data API URL')
      .default('https://api.bc-sample.store')
      .hideHelp(),
  )
  // eslint-disable-next-line complexity
  .action(async (options) => {
    const { ghRef, repository } = options;

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

    const URLSchema = z.string().url();
    const sampleDataApiUrl = parse(options.sampleDataApiUrl, URLSchema);
    const bigcommerceApiUrl = parse(`https://api.${options.bigcommerceHostname}`, URLSchema);
    const bigcommerceAuthUrl = parse(`https://login.${options.bigcommerceHostname}`, URLSchema);
    const resetMain = options.resetMain;

    let projectName;
    let projectDir;
    let storeHash = options.storeHash;
    let accessToken = options.accessToken;
    let channelId;
    let storefrontToken = options.storefrontToken;

    if (options.channelId) {
      channelId = parseInt(options.channelId, 10);
    }

    if (!pathExistsSync(options.projectDir)) {
      console.error(chalk.red(`Error: --projectDir ${options.projectDir} is not a valid path\n`));
      process.exit(1);
    }

    if (options.projectName) {
      projectName = kebabCase(options.projectName);
      projectDir = join(options.projectDir, projectName);

      if (pathExistsSync(projectDir)) {
        console.error(chalk.red(`Error: ${projectDir} already exists\n`));
        process.exit(1);
      }
    }

    if (!options.projectName) {
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

    if (storeHash && channelId && storefrontToken) {
      console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

      cloneCatalyst({ repository, projectName, projectDir, ghRef, resetMain });

      writeEnv(projectDir, {
        channelId: channelId.toString(),
        storeHash,
        storefrontToken,
        arbitraryEnv: options.env,
      });

      await installDependencies(projectDir);

      console.log(
        `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
        '\nNext steps:\n',
        chalk.yellow(`\ncd ${projectName} && pnpm run dev\n`),
      );

      process.exit(0);
    }

    if (!options.storeHash || !options.accessToken) {
      const credentials = await login(bigcommerceAuthUrl);

      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    if (!storeHash || !accessToken) {
      console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

      cloneCatalyst({ repository, projectName, projectDir, ghRef, resetMain });

      await installDependencies(projectDir);

      console.log(
        [
          `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
          `Next steps:`,
          chalk.yellow(`\n- cd ${projectName} && cp .env.example .env.local`),
          chalk.yellow(`\n- Populate .env.local with your BigCommerce API credentials\n`),
        ].join('\n'),
      );

      process.exit(0);
    }

    // At this point we should have a storeHash and can identify the account
    await telemetry.identify(storeHash);

    if (!channelId || !storefrontToken) {
      const bc = new Https({ bigCommerceApiUrl: bigcommerceApiUrl, storeHash, accessToken });
      const sampleDataApi = new Https({
        sampleDataApiUrl,
        storeHash,
        accessToken,
      });

      const eligibilityResponse = await sampleDataApi.checkEligibility();

      if (!eligibilityResponse.data.eligible) {
        console.warn(chalk.yellow(eligibilityResponse.data.message));
      }

      let shouldCreateChannel;

      if (eligibilityResponse.data.eligible) {
        shouldCreateChannel = await select({
          message: 'Would you like to create a new channel?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        });
      }

      if (shouldCreateChannel) {
        const newChannelName = await input({
          message: 'What would you like to name your new channel?',
        });

        const {
          data: { id: createdChannelId, storefront_api_token: storefrontApiToken },
        } = await sampleDataApi.createChannel(newChannelName);

        await bc.createChannelMenus(createdChannelId);

        channelId = createdChannelId;
        storefrontToken = storefrontApiToken;

        /**
         * @todo prompt sample data API
         */
      }

      if (!shouldCreateChannel) {
        const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

        const availableChannels = await bc.channels('?available=true&type=storefront');

        const existingChannel = await select({
          message: 'Which channel would you like to use?',
          choices: availableChannels.data
            .sort(
              (a, b) => channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform),
            )
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

        channelId = existingChannel.id;

        const {
          data: { token: sfToken },
        } = await bc.storefrontToken();

        storefrontToken = sfToken;
      }
    }

    if (!channelId) throw new Error('Something went wrong, channelId is not defined');
    if (!storefrontToken) throw new Error('Something went wrong, storefrontToken is not defined');

    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

    cloneCatalyst({ repository, projectName, projectDir, ghRef, resetMain });

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      storefrontToken,
      arbitraryEnv: options.env,
    });

    await installDependencies(projectDir);

    console.log(
      `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
      '\nNext steps:\n',
      chalk.yellow(`\ncd ${projectName} && pnpm run dev\n`),
    );
  });
