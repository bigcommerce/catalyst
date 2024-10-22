import { Command, Option } from '@commander-js/extra-typings';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import * as z from 'zod';

import { Https } from '../utils/https';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { Telemetry } from '../utils/telemetry/telemetry';
import { writeEnv } from '../utils/write-env';

const telemetry = new Telemetry();

export const init = new Command('init')
  .description('Connect a BigCommerce store with an existing Catalyst project')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
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
  .action(async (options) => {
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

    await telemetry.identify(storeHash);

    const bc = new Https({ bigCommerceApiUrl, storeHash, accessToken });
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

      channelId = createdChannelId;
      customerImpersonationToken = storefrontApiToken;

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
        data: { token },
      } = await bc.customerImpersonationToken();

      customerImpersonationToken = token;
    }

    if (!channelId) throw new Error('Something went wrong, channelId is not defined');
    if (!customerImpersonationToken)
      throw new Error('Something went wrong, customerImpersonationToken is not defined');

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      customerImpersonationToken,
    });
  });
