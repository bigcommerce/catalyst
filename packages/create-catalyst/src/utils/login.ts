import chalk from 'chalk';
import open from 'open';
import { createInterface } from 'readline';

import { Auth } from './auth';
import { Config } from './config';
import { spinner } from './spinner';

interface LoginResult {
  storeHash: string;
  accessToken: string;
}

interface DeviceCodeCredentials {
  store_hash: string;
  access_token: string;
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
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

async function waitForEnterKey(prompt: string): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

export async function login(baseUrl: string): Promise<LoginResult> {
  const auth = new Auth({ baseUrl });
  const deviceCode = (await auth.getDeviceCode()) as DeviceCodeResponse;

  console.log(chalk.cyan('\n! First copy your one-time code: ') + 
    chalk.bold.yellow(deviceCode.user_code));
    
  await waitForEnterKey(
    chalk.cyan(`\nPress Enter to open ${deviceCode.verification_uri} in your browser...`)
  );

  await open(deviceCode.verification_uri);

  const credentials = await spinner(
    () => waitForCredentials(auth, deviceCode.device_code, deviceCode.interval),
    { text: 'Waiting for authentication...', successText: 'Authentication successful!' },
  );

  return {
    storeHash: credentials.store_hash,
    accessToken: credentials.access_token,
  };
}

export function storeCredentials(projectDir: string, credentials: LoginResult): void {
  const config = new Config(projectDir);

  config.setAuth(credentials.storeHash, credentials.accessToken);
}
