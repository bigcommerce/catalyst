import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import * as z from 'zod';

import { type InitCommandOptions } from '../index';
import { checkStorefrontLimit } from '../utils/check-storefront-limit';
import { Https } from '../utils/https';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { writeEnv } from '../utils/write-env';

export const init = async (options: InitCommandOptions) => {
  const projectDir = process.cwd();

  const URLSchema = z.string().url();
  const sampleDataApiUrl = parse(options.sampleDataApiUrl, URLSchema);
  const bigCommerceApiUrl = `https://api.${options.bigcommerceHostname}`;
  const bigCommerceAuthUrl = `https://login.${options.bigcommerceHostname}`;

  let storeHash = options.storeHash;
  let accessToken = options.accessToken;
  let channelId;
  let customerImpersonationToken;

  if (!options.storeHash || !options.accessToken) {
    const credentials = await login(bigCommerceAuthUrl);

    storeHash = credentials.storeHash;
    accessToken = credentials.accessToken;
  }

  if (!storeHash || !accessToken) {
    console.log(
      chalk.yellow('\nYou must authenticate with a store to overwrite your local environment.\n'),
    );

    process.exit(1);
  }

  const bc = new Https({ bigCommerceApiUrl, storeHash, accessToken });

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
        .sort((a, b) => channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform))
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

  if (!channelId) throw new Error('Something went wrong, channelId is not defined');
  if (!customerImpersonationToken)
    throw new Error('Something went wrong, customerImpersonationToken is not defined');

  writeEnv(projectDir, {
    channelId: channelId.toString(),
    storeHash,
    accessToken,
    customerImpersonationToken,
  });
};
