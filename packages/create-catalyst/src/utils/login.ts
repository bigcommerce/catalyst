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

async function waitForKeyPress(prompt: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Enable raw mode to get individual keystrokes
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      // Restore normal stdin mode
      process.stdin.setRawMode(false);
      process.stdin.pause();
      rl.close();

      // Check if escape key was pressed (27 is the ASCII code for escape)
      const shouldProceed = data[0] !== 27;

      // Add a newline since we're in raw mode
      process.stdout.write('\n');

      resolve(shouldProceed);
    });

    // Display the prompt
    rl.write(prompt);
  });
}

export async function login(baseUrl: string): Promise<LoginResult> {
  const auth = new Auth({ baseUrl });

  const deviceCode = await auth.getDeviceCode();

  console.log(
    chalk.cyan('\nPlease visit the following URL to authenticate with your BigCommerce store:'),
  );
  console.log(chalk.yellow(`\n${deviceCode.verification_uri}\n`));
  console.log(chalk.cyan(`Enter code: `) + chalk.yellow(`${deviceCode.user_code}\n`));

  const shouldOpenUrl = await waitForKeyPress(
    'Press any key to open the URL in your browser (or ESC to skip)...',
  );

  if (shouldOpenUrl) {
    await open(deviceCode.verification_uri);
  }

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
