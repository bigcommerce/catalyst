import { colorize } from 'consola/utils';
import open from 'open';
import yoctoSpinner from 'yocto-spinner';

import { requestDeviceCode, waitForDeviceToken } from './auth';
import { consola } from './logger';

export interface LoginResult {
  storeHash: string;
  accessToken: string;
}

export async function login(loginUrl: string): Promise<LoginResult> {
  const deviceCode = await requestDeviceCode(loginUrl);

  consola.info(
    `${colorize('yellow', 'Your one-time code:')} ${colorize('bold', deviceCode.user_code)}`,
  );

  try {
    await open(deviceCode.verification_uri);
    consola.info(`Opened ${deviceCode.verification_uri} in your browser.`);
  } catch {
    consola.info(`Open ${deviceCode.verification_uri} in your browser and enter the code above.`);
  }

  const spinner = yoctoSpinner().start('Waiting for authentication...');

  const credentials = await waitForDeviceToken(
    loginUrl,
    deviceCode.device_code,
    deviceCode.interval,
  );

  spinner.success('Authentication complete.');

  return {
    storeHash: credentials.store_hash,
    accessToken: credentials.access_token,
  };
}
