import { Command, Option } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import * as z from 'zod';

import { Https } from '../utils/https';
import { login } from '../utils/login';
import { parse } from '../utils/parse';
import { Telemetry } from '../utils/telemetry/telemetry';
import { writeEnv } from '../utils/write-env';

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
    new Option('--cli-api-hostname <hostname>', 'Catalyst CLI API hostname')
      .default('cxm-prd.bigcommerceapp.com')
      .hideHelp(),
  )
  .action(async (options) => {
    const projectDir = process.cwd();

    const URLSchema = z.string().url();
    const bigCommerceApiUrl = `https://api.${options.bigcommerceHostname}`;
    const bigCommerceAuthUrl = `https://login.${options.bigcommerceHostname}`;
    const cliApiUrl = parse(`https://${options.cliApiHostname}`, URLSchema);

    let storeHash = options.storeHash;
    let accessToken = options.accessToken;

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
    const cliApi = new Https({
      bigCommerceApiUrl: `${cliApiUrl}/stores/${storeHash}/cli-api/v3`,
      storeHash,
      accessToken,
    });

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

    const channelId = existingChannel.id;

    // Get channel init data
    const initResponse = await cliApi.api(`/channels/${channelId}/init`, {
      method: 'GET',
    });

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
