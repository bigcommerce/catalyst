import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';

import { type InitCommandOptions } from '../index';
import { Https } from '../utils/https';
import { login } from '../utils/login';
import { writeEnv } from '../utils/write-env';

export const init = async (options: InitCommandOptions) => {
  const projectDir = process.cwd();
  const bigCommerceApiUrl = `https://api.${options.bigcommerceHostname}`;
  const bigCommerceAuthUrl = `https://login.${options.bigcommerceHostname}`;
  const { storeHash, accessToken } = await login(
    bigCommerceAuthUrl,
    options.storeHash,
    options.accessToken,
  );

  if (!storeHash || !accessToken) {
    console.log(
      chalk.yellow('\nNo store hash or access token provided. Unable to write new environment.\n'),
    );

    process.exit(1);
  }

  const bc = new Https({ bigCommerceApiUrl, storeHash, accessToken });

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

  let channelId = 0;
  let customerImpersonationToken = '';

  if (!canCreateChannel) {
    const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

    const existingChannel = await select({
      message: 'Which channel would you like to use?',
      choices: activeChannels
        .sort((a, b) => channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform))
        .map((channel) => ({
          name: channel.name,
          value: channel,
          description: `Channel Platform: ${
            channel.platform === 'bigcommerce'
              ? 'Stencil'
              : channel.platform.charAt(0).toUpperCase() + channel.platform.slice(1)
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

  writeEnv(projectDir, {
    channelId: channelId.toString(),
    storeHash,
    accessToken,
    customerImpersonationToken,
  });
};
