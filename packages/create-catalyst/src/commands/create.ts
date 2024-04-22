import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { exec as execCallback } from 'child_process';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';
import { promisify } from 'util';
import { z } from 'zod';

import { type CreateCommandOptions } from '..';
import { checkStorefrontLimit } from '../utils/check-storefront-limit';
import { cloneCatalyst } from '../utils/clone-catalyst';
import { Https } from '../utils/https';
import { installDependencies } from '../utils/install-dependencies';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { spinner } from '../utils/spinner';
import { writeEnv } from '../utils/write-env';

const exec = promisify(execCallback);

export const create = async (options: CreateCommandOptions) => {
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
      } = await bc.customerImpersonationToken(channelId);

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

  await spinner(exec(`${packageManager} run lint -- --fix`, { cwd: projectDir }), {
    text: 'Linting to validate generated types...',
    successText: 'GraphQL types validated successfully',
    failText: (err) => chalk.red(`Failed to validate GraphQL types: ${err.message}`),
  });

  console.log(
    `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
    '\nNext steps:\n',
    chalk.yellow(`\ncd ${projectName} && ${packageManager} run dev\n`),
  );
};
