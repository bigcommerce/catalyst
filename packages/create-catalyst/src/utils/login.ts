/* eslint-disable no-await-in-loop */

import { select } from '@inquirer/prompts';
import chalk from 'chalk';

import { Https } from './https';
import { spinner } from './spinner';

const poll = async (auth: Https, deviceCode: string, interval: number, expiresIn: number) => {
  const intervalMs = interval * 1000;
  const expiresAtMs = expiresIn * 1000;
  const retries = expiresAtMs / intervalMs;

  for (let i = 0; i < retries; i += 1) {
    try {
      return await auth.checkDeviceCode(deviceCode);
    } catch {
      // noop
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  console.error(chalk.red('\nDevice code expired. Please try again.\n'));
  process.exit(1);
};

export const login = async (
  bigCommerceAuthUrl: string,
  storeHash?: string,
  accessToken?: string,
) => {
  if (storeHash && accessToken) {
    return { storeHash, accessToken };
  }

  const shouldLogin = await select({
    message: 'Would you like to connect to a BigCommerce store?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });

  if (!shouldLogin) {
    return { storeHash, accessToken };
  }

  const auth = new Https({ bigCommerceAuthUrl });

  const deviceCode = await auth.getDeviceCode();

  console.log(
    [
      `\nPlease visit ${chalk.cyan(deviceCode.verification_uri)} and enter the code: ${chalk.yellow(
        deviceCode.user_code,
      )}\n`,
      `The code will expire in ${chalk.yellow(`${deviceCode.expires_in / 60} minutes`)}\n`,
    ].join('\n'),
  );

  const { store_hash, access_token } = await spinner(
    poll(auth, deviceCode.device_code, deviceCode.interval, deviceCode.expires_in),
    {
      text: 'Waiting for device code to be authorized',
      successText: 'Device code authorized\n',
      failText: 'Device code expired\n',
    },
  );

  return {
    storeHash: store_hash,
    accessToken: access_token,
  };
};
