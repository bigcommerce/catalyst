import { Command, Option } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import * as z from 'zod';

import { type Channel, type ChannelsResponse, Https, type InitResponse } from '../utils/https';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { Telemetry } from '../utils/telemetry/telemetry';
import { writeEnv } from '../utils/write-env';

const telemetry = new Telemetry();

/**
 * The `init` command connects your local Catalyst project to an existing BigCommerce channel.
 * It helps you:
 * 1. Connect to a BigCommerce store (via CLI args or interactive login)
 * 2. Select an existing channel (via CLI args or interactive selection)
 * 3. Configure your local environment variables with:
 *    - Channel ID
 *    - Store Hash
 *    - Storefront Token
 *    - Makeswift API Key (if available)
 *
 * To create a new channel, use the `create` command instead.
 *
 * Usage:
 *   - Interactive: `create-catalyst init`
 *   - With args: `create-catalyst init --store-hash <hash> --access-token <token> --channel-id <id>`
 */
export const init = new Command('init')
  .description('Connect your Catalyst project to an existing BigCommerce channel')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'Existing BigCommerce channel ID to connect to')
  .addOption(
    new Option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
      .default('bigcommerce.com')
      .hideHelp(),
  )
  .addOption(
    new Option('--cli-api-hostname <hostname>', 'BigCommerce CLI API hostname')
      .default('cxm-prd.bigcommerceapp.com')
      .hideHelp(),
  )
  .action(async (options) => {
    const projectDir = process.cwd();

    const URLSchema = z.string().url();
    const cliApiUrl = parse(`https://${options.cliApiHostname}`, URLSchema);
    const bigcommerceAuthUrl = parse(`https://login.${options.bigcommerceHostname}`, URLSchema);

    let storeHash = options.storeHash;
    let accessToken = options.accessToken;
    let channelId = options.channelId ? parseInt(options.channelId, 10) : undefined;
    let storefrontToken;
    let makeswiftApiKey;

    if (!storeHash || !accessToken) {
      const credentials = await login(bigcommerceAuthUrl);

      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    if (!storeHash || !accessToken) {
      console.log(
        chalk.yellow('\nYou must authenticate with a store to configure your local environment.\n'),
      );
      process.exit(1);
    }

    await telemetry.identify(storeHash);

    const cliApi = new Https({
      bigCommerceApiUrl: `${cliApiUrl}/stores/${storeHash}/cli-api/v3`,
      storeHash,
      accessToken,
    });

    if (!channelId) {
      const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];
      const availableChannels = await cliApi.get<ChannelsResponse>(
        '/channels?available=true&type=storefront',
      );

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

      channelId = existingChannel.id;
      storefrontToken = existingChannel.storefront_api_token;
    }

    if (!channelId) throw new Error('Something went wrong, channelId is not defined');
    if (!storefrontToken) throw new Error('Something went wrong, storefrontToken is not defined');

    try {
      const initResponse = await cliApi.get<InitResponse>(`/channels/${channelId}/init`);

      makeswiftApiKey = initResponse.data.makeswift_dev_api_key;
    } catch {
      console.warn(
        chalk.yellow(
          '\nWarning: Could not fetch Makeswift API key. If you need Makeswift integration, please configure it manually.\n',
        ),
      );
    }

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      storefrontToken,
      ...(makeswiftApiKey && { MAKESWIFT_SITE_API_KEY: makeswiftApiKey }),
    });

    console.log(
      chalk.green('\nSuccess!'),
      'Your local environment has been configured with the selected channel.\n',
    );
  });
