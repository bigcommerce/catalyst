import { Command, Option } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import { green, red, yellow } from 'ansis';

import { CliApi } from '../utils/cli-api';
import { Config } from '../utils/config';
import { Https } from '../utils/https';
import { login, storeCredentials } from '../utils/login';
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

function isChannelsResponse(response: unknown): response is ChannelsResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray(response.data) &&
    response.data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'name' in item &&
        'platform' in item,
    )
  );
}

function isInitResponse(response: unknown): response is InitResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'storefront_api_token' in response.data &&
    'envVars' in response.data
  );
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

    // Check for stored credentials
    if (!storeHash || !accessToken) {
      const config = new Config(projectDir);
      const storedAuth = config.getAuth();

      storeHash = storeHash ?? storedAuth.storeHash;
      accessToken = accessToken ?? storedAuth.accessToken;
    }

    if (!storeHash || !accessToken) {
      const credentials = await login(`https://login.${options.bigcommerceHostname}`);

      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;

      // Store credentials after successful authentication
      storeCredentials(projectDir, credentials);
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
        red(
          `\nGET /v3/channels failed: ${channelsResponse.status} ${channelsResponse.statusText}\n`,
        ),
      );
      process.exit(1);
    }

    const availableChannels: unknown = await channelsResponse.json();

    if (!isChannelsResponse(availableChannels)) {
      console.error(red('\nUnexpected response format from channels endpoint\n'));
      process.exit(1);
    }

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

    const channelId = existingChannel.id;

    // Get channel init data
    const initResponse = await cliApi.getChannelInit(channelId);

    if (!initResponse.ok) {
      console.error(
        red(
          `\nGET /channels/${channelId}/init failed: ${initResponse.status} ${initResponse.statusText}\n`,
        ),
      );
      process.exit(1);
    }

    const initData: unknown = await initResponse.json();

    if (!isInitResponse(initData)) {
      console.error(red('\nUnexpected response format from init endpoint\n'));
      process.exit(1);
    }

    const envVars = { ...initData.data.envVars };

    // Add any CLI-provided env vars as overrides
    if (options.env) {
      const cliEnvVars = options.env.reduce<Record<string, string>>((acc, env) => {
        const [key, value] = env.split('=');

        if (key && value) {
          acc[key] = value;
        }

        return acc;
      }, {});

      Object.assign(envVars, cliEnvVars);
    }

    writeEnv(projectDir, envVars);

    console.log(green(`\n.env.local file created for channel ${existingChannel.name}!\n`));
    console.log(green(`\nNext steps:\n`));
    console.log(yellow(`\npnpm run dev\n`));
  });
