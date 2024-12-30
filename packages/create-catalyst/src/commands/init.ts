import { Command, Option } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import * as z from 'zod';

import { CliApi } from '../utils/cli-api';
import { Https } from '../utils/https';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
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

const telemetry = new Telemetry();

export const init = new Command('init')
  .description('Connect a BigCommerce store with an existing Catalyst project')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
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
  .action(async (options) => {
    const projectDir = process.cwd();

    let storeHash = options.storeHash;
    let accessToken = options.accessToken;

    if (!options.storeHash || !options.accessToken) {
      const credentials = await login(`https://login.${options.bigcommerceHostname}`);

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

    const bc = new Https({
      baseUrl: `https://api.${options.bigcommerceHostname}/stores/${storeHash}`,
      accessToken,
    });

    const cliApi = new CliApi({
      origin: options.cliApiOrigin,
      storeHash,
      accessToken,
    });

    const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];
    const channelsResponse = await bc.fetch('/v3/channels?available=true&type=storefront');

    if (!channelsResponse.ok) {
      console.error(
        chalk.red(`\nGET /v3/channels failed: ${channelsResponse.status} ${channelsResponse.statusText}\n`),
      );
      process.exit(1);
    }

    const availableChannels = (await channelsResponse.json()) as ChannelsResponse;

    const existingChannel = await select({
      message: 'Which channel would you like to use?',
      choices: availableChannels.data
        .sort(
          (a: Channel, b: Channel) => channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform),
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

    const channelId = (existingChannel as Channel).id;

    // Get channel init data
    const initResponse = await cliApi.getChannelInit(channelId);

    if (!initResponse.ok) {
      console.error(
        chalk.red(
          `\nGET /channels/${channelId}/init failed: ${initResponse.status} ${initResponse.statusText}\n`,
        ),
      );
      process.exit(1);
    }

    const initData = (await initResponse.json()) as InitResponse;
    const envVars = { ...initData.data.envVars };

    // Add any CLI-provided env vars as overrides
    if (options.env) {
      const cliEnvVars = options.env.reduce((acc, env) => {
        const [key, value] = env.split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      Object.assign(envVars, cliEnvVars);
    }

    writeEnv(projectDir, envVars);
  });
