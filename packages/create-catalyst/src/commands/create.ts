import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

import { type CreateCommandOptions } from '../index';
import { cloneCatalyst } from '../utils/clone-catalyst';
import { Https } from '../utils/https';
import { installDependencies } from '../utils/install-dependencies';
import { login } from '../utils/login';
import { projectConfig } from '../utils/project-config';
import { spinner } from '../utils/spinner';
import { writeEnv } from '../utils/write-env';

const exec = promisify(execCallback);

export const create = async (options: CreateCommandOptions) => {
  const pm = options.packageManager;
  const bigCommerceApiUrl = `https://api.${options.bigcommerceHostname}`;
  const bigCommerceAuthUrl = `https://login.${options.bigcommerceHostname}`;
  const { projectName, projectDir } = await projectConfig({
    projectDir: options.projectDir,
    projectName: options.projectName,
  });
  const { storeHash, accessToken } = await login(
    bigCommerceAuthUrl,
    options.storeHash,
    options.accessToken,
  );

  if (!storeHash || !accessToken) {
    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

    await cloneCatalyst({ projectDir, projectName, ghRef: options.ghRef });

    console.log(`\nUsing ${chalk.bold(pm)}\n`);

    await installDependencies(projectDir, pm);

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

  const bc = new Https({ bigCommerceApiUrl, storeHash, accessToken });

  let channelId = options.channelId ? options.channelId : 0;
  let customerImpersonationToken = options.customerImpersonationToken
    ? options.customerImpersonationToken
    : '';

  if (!channelId || !customerImpersonationToken) {
    const { data: channels } = await bc.channels();
    const {
      features: { storefront_limits: limits },
    } = await bc.storeInformation();

    const activeStatus = ['prelaunch', 'active', 'connected'];
    const activeChannels = channels.filter((ch) => activeStatus.includes(ch.status));

    let canCreateChannel = true;

    if (activeChannels.length >= limits.active) {
      canCreateChannel = false;
    } else if (channels.length >= limits.total_including_inactive) {
      canCreateChannel = false;
    } else {
      console.log(`${limits.active - activeChannels.length} active channels remaining.`);
    }

    if (!canCreateChannel) {
      const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

      const existingChannel = await select({
        message: 'Which channel would you like to use?',
        choices: activeChannels
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
    } else {
      const newChannelName = await input({
        message: 'What would you like to name your new channel?',
      });

      const sampleDataApi = new Https({
        sampleDataApiUrl: options.sampleDataApiUrl,
        storeHash,
        accessToken,
      });

      const {
        data: { id: createdChannelId, storefront_api_token: storefrontApiToken },
      } = await sampleDataApi.createChannel(newChannelName);

      channelId = createdChannelId;
      customerImpersonationToken = storefrontApiToken;
    }
  }

  console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

  await cloneCatalyst({ projectDir, projectName, ghRef: options.ghRef });

  writeEnv(projectDir, {
    channelId: channelId.toString(),
    storeHash,
    accessToken,
    customerImpersonationToken,
  });

  console.log(`\nUsing ${chalk.bold(pm)}\n`);

  await installDependencies(projectDir, pm);

  await spinner(exec(`${pm} run codegen`, { cwd: projectDir }), {
    text: 'Generating GraphQL types...',
    successText: 'GraphQL types generated successfully',
    failText: (err) => chalk.red(`Failed to generate GraphQL types: ${err.message}`),
  });

  await spinner(exec(`${pm} run lint --fix`, { cwd: projectDir }), {
    text: 'Linting to validate generated types...',
    successText: 'GraphQL types validated successfully',
    failText: (err) => chalk.red(`Failed to validate GraphQL types: ${err.message}`),
  });

  console.log(
    `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
    '\nNext steps:\n',
    chalk.yellow(`\ncd ${projectName} && ${pm} run dev\n`),
  );
};
