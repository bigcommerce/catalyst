import chalk from 'chalk';
import open from 'open';

import { Auth } from './auth';
import { Config } from './config';

interface LoginResult {
  storeHash: string;
  accessToken: string;
}

interface DeviceCodeCredentials {
  store_hash: string;
  access_token: string;
}

async function pollDeviceCode(
  auth: Auth,
  deviceCode: string,
  interval: number,
): Promise<DeviceCodeCredentials | null> {
  try {
    const credentials = await auth.checkDeviceCode(deviceCode);

    return credentials;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));

    return null;
  }
}

async function waitForCredentials(
  auth: Auth,
  deviceCode: string,
  interval: number,
): Promise<DeviceCodeCredentials> {
  const credentials = await pollDeviceCode(auth, deviceCode, interval);

  if (credentials) {
    return credentials;
  }

  return waitForCredentials(auth, deviceCode, interval);
}

export async function login(baseUrl: string): Promise<LoginResult> {
  const auth = new Auth({ baseUrl });

  const deviceCode = await auth.getDeviceCode();

  console.log(
    chalk.cyan('\nPlease visit the following URL to authenticate with your BigCommerce store:'),
  );
  console.log(chalk.yellow(`\n${deviceCode.verification_uri}\n`));
  console.log(chalk.cyan(`Enter code: `) + chalk.yellow(`${deviceCode.user_code}\n`));

  await open(deviceCode.verification_uri);

  const credentials = await waitForCredentials(auth, deviceCode.device_code, deviceCode.interval);

  return {
    storeHash: credentials.store_hash,
    accessToken: credentials.access_token,
  };
}

export function storeCredentials(projectDir: string, credentials: LoginResult): void {
  const config = new Config(projectDir);

  config.setAuth(credentials.storeHash, credentials.accessToken);
}
