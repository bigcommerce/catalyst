import { Command, Option } from '@commander-js/extra-typings';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { exec as execCallback } from 'child_process';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';
import { promisify } from 'util';
import { z } from 'zod';

import { applyIntegrations } from '../utils/apply-integrations';
import { checkStorefrontLimit } from '../utils/check-storefront-limit';
import { cloneCatalyst } from '../utils/clone-catalyst';
import { getLatestCoreTag } from '../utils/get-latest-core-tag';
import { Https } from '../utils/https';
import { installDependencies } from '../utils/install-dependencies';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { getPackageManager, packageManagerChoices } from '../utils/pm';
import { spinner } from '../utils/spinner';
import { writeEnv } from '../utils/write-env';

const exec = promisify(execCallback);

export const create = new Command('create')
  .description('Command to scaffold and connect a Catalyst storefront to your BigCommerce store')
  .option('--project-name <name>', 'Name of your Catalyst project')
  .option('--project-dir <dir>', 'Directory in which to create your project', process.cwd())
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'BigCommerce channel ID')
  .option('--customer-impersonation-token <token>', 'BigCommerce customer impersonation token')
  .option('--integrations <providers...>', 'Integrations to include in your project')
  .addOption(
    new Option(
      '--gh-ref <ref>',
      'Clone a specific ref from the bigcommerce/catalyst repository',
    ).default(getLatestCoreTag),
  )
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
  .addOption(
    new Option('--package-manager <pm>', 'Override detected package manager')
      .choices(packageManagerChoices)
      .default(getPackageManager())
      .hideHelp(),
  )
  .addOption(
    new Option('--code-editor <editor>', 'Your preferred code editor')
      .choices(['vscode'])
      .default('vscode')
      .hideHelp(),
  )
  .addOption(
    new Option('--include-functional-tests', 'Include the functional test suite')
      .default(false)
      .hideHelp(),
  )
  .action(async (options) => {
    const { packageManager, codeEditor, includeFunctionalTests } = options;

    const URLSchema = z.string().url();
    const sampleDataApiUrl = parse(options.sampleDataApiUrl, URLSchema);
    const bigcommerceApiUrl = parse(`https://api.${options.bigcommerceHostname}`, URLSchema);
    const bigcommerceAuthUrl = parse(`https://login.${options.bigcommerceHostname}`, URLSchema);

    let ghRef: string;

    if (options.ghRef instanceof Function) {
      ghRef = await options.ghRef();
    } else {
      ghRef = options.ghRef;
    }

    let projectName;
    let projectDir;
    let storeHash = options.storeHash;
    let accessToken = options.accessToken;
    let channelId;
    let customerImpersonationToken = options.customerImpersonationToken;

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

    if (!options.storeHash || !options.accessToken) {
      const credentials = await login(bigcommerceAuthUrl);

      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    if (!projectName) throw new Error('Something went wrong, projectName is not defined');
    if (!projectDir) throw new Error('Something went wrong, projectDir is not defined');

    if (!storeHash || !accessToken) {
      console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

      await cloneCatalyst({ projectDir, projectName, ghRef, codeEditor, includeFunctionalTests });

      console.log(`\nUsing ${chalk.bold(packageManager)}\n`);

      await installDependencies(projectDir, packageManager);

      await applyIntegrations(options.integrations, { projectDir });

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

    if (!channelId || !customerImpersonationToken) {
      const bc = new Https({ bigCommerceApiUrl: bigcommerceApiUrl, storeHash, accessToken });
      const availableChannels = await bc.channels('?available=true&type=storefront');
      const storeInfo = await bc.storeInformation();

      const canCreateChannel = checkStorefrontLimit(availableChannels, storeInfo);

      let shouldCreateChannel;

      if (canCreateChannel) {
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

        const sampleDataApi = new Https({
          sampleDataApiUrl,
          storeHash,
          accessToken,
        });

        const {
          data: { id: createdChannelId, storefront_api_token: storefrontApiToken },
        } = await sampleDataApi.createChannel(newChannelName);

        await bc.createChannelMenus(createdChannelId);

        channelId = createdChannelId;
        customerImpersonationToken = storefrontApiToken;

        /**
         * @todo prompt sample data API
         */
      }

      if (!shouldCreateChannel) {
        const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

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
          data: { token },
        } = await bc.customerImpersonationToken();

        customerImpersonationToken = token;
      }
    }

    if (!channelId) throw new Error('Something went wrong, channelId is not defined');
    if (!customerImpersonationToken)
      throw new Error('Something went wrong, customerImpersonationToken is not defined');

    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

    await cloneCatalyst({ projectDir, projectName, ghRef, codeEditor, includeFunctionalTests });

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      accessToken,
      customerImpersonationToken,
    });

    console.log(`\nUsing ${chalk.bold(packageManager)}\n`);

    await installDependencies(projectDir, packageManager);

    await spinner(exec(`${packageManager} run --prefix ${projectDir} generate`), {
      text: 'Creating GraphQL schema...',
      successText: 'Created GraphQL schema',
      failText: (err) => chalk.red(`Failed to create GraphQL schema: ${err.message}`),
    });

    await applyIntegrations(options.integrations, { projectDir });

    console.log(
      `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
      '\nNext steps:\n',
      chalk.yellow(`\ncd ${projectName} && ${packageManager} run dev\n`),
    );
  });
