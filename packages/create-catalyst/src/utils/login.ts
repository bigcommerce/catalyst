import { colorize } from 'consola/utils';
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

      // Only proceed if Enter was pressed (13 or 10 are the ASCII codes for CR and LF)
      const shouldProceed = data[0] === 13 || data[0] === 10;

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
    colorize('yellow', '\n! First copy your one-time code: ') +
      colorize('bold', deviceCode.user_code),
  );
  console.log(`Press Enter to open ${deviceCode.verification_uri} in your browser...`);

  const shouldOpenUrl = await waitForKeyPress('');

  if (shouldOpenUrl) {
    await open(deviceCode.verification_uri);
  }

  const credentials = await spinner(
    () => waitForCredentials(auth, deviceCode.device_code, deviceCode.interval),
    { text: 'Waiting for authentication...', successText: 'Authentication complete' },
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
