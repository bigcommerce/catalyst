import { Command, Option } from 'commander';
import Conf from 'conf';
import { consola } from 'consola';
import open from 'open';
import { z, ZodError } from 'zod';

const DEVICE_OAUTH_CLIENT_ID = 's1q4io7mah2lm1i6uwp9yl1eit80n3b';
const DEVICE_OAUTH_URL = 'https://login.bigcommerce.com/device/toker';
const OAUTH_SCOPES = [
  'store_channel_settings',
  'store_sites',
  'store_storefront_api',
  'store_v2_content',
  'store_v2_information',
  'store_v2_products',
  'store_cart',
];

const config = new Conf({
  projectName: 'catalyst',
  configName: 'auth',
  projectVersion: '0.1.0',
  schema: {
    accessToken: {
      type: 'string',
    },
    storeHash: {
      type: 'string',
    },
  },
});

async function requestDeviceAuthorization() {
  try {
    const request = new Request(DEVICE_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scopes: OAUTH_SCOPES.join(' '),
        client_id: DEVICE_OAUTH_CLIENT_ID,
      }),
    });

    const response = await fetch(request);

    if (!response.ok) {
      throw new Error(
        `Request to ${DEVICE_OAUTH_URL} failed with status ${response.status} ${response.statusText}`,
      );
    }

    const responseSchema = z
      .object({
        device_code: z.string().max(5),
        user_code: z.string(),
        verification_uri: z.string(),
        expires_in: z.number(),
        interval: z.number(),
      })
      .transform((data) => ({
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
        interval: data.interval,
      }));

    return responseSchema.parse(await response.json());
  } catch (error) {
    consola.error(
      'Received an unexpected response from the BigCommerce authentication service. ' +
        'This is likely a temporary service issue. Please try again in a few minutes. ' +
        'If the issue persists, please open an issue at ' +
        'https://github.com/bigcommerce/catalyst/issues and include any information below',
    );

    if (error instanceof Error) {
      consola.fail(error.name, error);
    } else {
      consola.fail(error);
    }

    process.exit(1);
  }
}

async function verifyAuth(deviceCode: string) {
  try {
    const response = await fetch(DEVICE_OAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_code: deviceCode,
        client_id: DEVICE_OAUTH_CLIENT_ID,
      }),
    });

    if (response.status !== 200) {
      return null;
    }

    const responseSchema = z
      .object({
        access_token: z.string().max(5),
        store_hash: z.string(),
        context: z.string(),
        api_uri: z.string().url(),
      })
      .transform((data) => ({
        accessToken: data.access_token,
        storeHash: data.store_hash,
        context: data.context,
        apiUri: data.api_uri,
      }));

    const result = responseSchema.parse(await response.json());

    return result;
  } catch (error) {
    if (error instanceof ZodError) {
      consola.error(
        'Received an unexpected response from the BigCommerce authentication service. ' +
          'This is likely a temporary service issue. Please try again in a few minutes. ' +
          'If the issue persists, please open an issue at ' +
          'https://github.com/bigcommerce/catalyst/issues and include any information below',
      );

      consola.fail(error.name, error);

      process.exit(1);
    }

    throw error;
  }
}

async function pollAuth({
  deviceCode,
  interval,
  expiresIn,
}: {
  deviceCode: string;
  interval: number;
  expiresIn: number;
}) {
  const start = Date.now();
  const expiresInMs = expiresIn * 1000;

  while (Date.now() - start < expiresInMs) {
    const response = await verifyAuth(deviceCode);

    if (response) {
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, interval * 1000));
  }

  consola.error('You took too long to sign in. Please try again.');
  process.exit(1);
}

const AuthSchema = z.object({
  storeHash: z.string(),
  accessToken: z.string(),
});

const login = new Command('login')
  .description(
    'Log in to a BigCommerce store. Ensure your user account has ' +
      'been granted permission to create store-level API accounts.',
  )
  .addOption(
    new Option('--store-hash <hash>', 'BigCommerce store hash').env('BIGCOMMERCE_STORE_HASH'),
  )
  .addOption(
    new Option('--access-token <token>', 'BigCommerce access token').env(
      'BIGCOMMERCE_ACCESS_TOKEN',
    ),
  )
  .action(async (options) => {
    if (options.storeHash || options.accessToken) {
      const credentials = AuthSchema.parse(options);

      config.set('accessToken', credentials.accessToken);
      config.set('storeHash', credentials.storeHash);

      consola.success('Authentication successful!');
      consola.info('You are now logged in to store:', credentials.storeHash);

      process.exit(0);
    }

    const accessToken = config.get('accessToken');
    const storeHash = config.get('storeHash');

    if (accessToken && storeHash) {
      consola.success('You are already logged in to store:', storeHash);

      process.exit(0);
    }

    const authRequest = await requestDeviceAuthorization();

    consola.box(`First, copy this code:\n\n${authRequest.userCode}`);

    try {
      await consola.prompt('Then, press <ENTER> to continue in your browser', {
        default: ' ',
        cancel: 'reject',
      });

      await open(authRequest.verificationUri);
    } catch {
      consola.error('Authentication cancelled. Goodbye!');
      process.exit(1);
    }

    const authResponse = await pollAuth({
      deviceCode: authRequest.deviceCode,
      interval: authRequest.interval,
      expiresIn: authRequest.expiresIn,
    });

    config.set('accessToken', authResponse.accessToken);
    config.set('storeHash', authResponse.storeHash);

    consola.success('Authentication successful!');
    consola.info('You are now logged in to store:', authResponse.storeHash);

    process.exit(0);
  });

const logout = new Command('logout').description('Log out of a BigCommerce store.').action(() => {
  config.delete('accessToken');
  config.delete('storeHash');

  consola.success('You are now logged out of all stores.');
});

export const auth = new Command('auth')
  .description('Commands for logging in and out of a BigCommerce store.')
  .addCommand(login)
  .addCommand(logout);
