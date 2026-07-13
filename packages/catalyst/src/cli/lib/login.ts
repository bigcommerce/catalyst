import { confirm, input, password } from '@inquirer/prompts';
import { colorize } from 'consola/utils';
import open from 'open';
import yoctoSpinner from 'yocto-spinner';
import { z } from 'zod';

import { DEVICE_OAUTH_SCOPES, requestDeviceCode, waitForDeviceToken } from './auth';
import { copyToClipboard } from './clipboard';
import { UserActionableError } from './errors';
import { consola } from './logger';

export interface LoginResult {
  storeHash: string;
  accessToken: string;
}

// Thrown when the user declines the manual-login fallback after the browser
// (device-code) flow has failed. Callers should treat this as a clean exit,
// not an error — the user explicitly chose to abort.
export class LoginAbortedError extends Error {
  constructor() {
    super('Login aborted by user.');
    this.name = 'LoginAbortedError';
  }
}

const StoreProfileSchema = z.object({
  data: z.object({
    store_name: z.string(),
  }),
});

async function fetchStoreProfile(storeHash: string, accessToken: string, apiHost: string) {
  const response = await fetch(`https://${apiHost}/stores/${storeHash}/v3/settings/store/profile`, {
    method: 'GET',
    headers: {
      'X-Auth-Token': accessToken,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const res: unknown = await response.json();
  const result = StoreProfileSchema.safeParse(res);

  if (!result.success) {
    throw new Error('Unexpected response from store profile API');
  }

  return result.data.data;
}

async function deviceCodeLogin(loginUrl: string): Promise<LoginResult> {
  const deviceCode = await requestDeviceCode(loginUrl);

  consola.info(
    `${colorize('yellow', 'Your one-time code:')} ${colorize('bold', deviceCode.user_code)}`,
  );

  // Wait for the user to acknowledge before hijacking their browser. This keeps
  // the UX consistent across `create`, `auth login`, and the channel commands.
  // In non-interactive contexts (CI, piped stdin) there's nobody to press
  // Enter, so skip straight to opening the verification URL.
  if (process.stdin.isTTY) {
    await input({ message: 'Press Enter to open your browser and sign in' });

    // Best-effort: drop the code on the clipboard so the user can paste it
    // straight into the verification page. We already printed it above as a
    // fallback, and a clipboard failure must never interrupt the flow.
    const copied = await copyToClipboard(deviceCode.user_code);

    if (copied) {
      consola.info('Copied the code to your clipboard — paste it into the sign-in page.');
    }
  }

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

async function manualLogin(apiHost: string): Promise<LoginResult> {
  consola.info(
    'Create a store-level API account from your BigCommerce Control Panel:\n' +
      '  Settings → API → Store-level API accounts → Create API account\n' +
      `Grant these OAuth scopes: ${DEVICE_OAUTH_SCOPES}`,
  );

  const storeHashInput = await input({ message: 'Store hash:' });
  const storeHash = storeHashInput.trim();

  if (!storeHash) {
    throw new UserActionableError('Store hash is required.');
  }

  const accessTokenInput = await password({ message: 'Access token:', mask: true });
  const accessToken = accessTokenInput.trim();

  if (!accessToken) {
    throw new UserActionableError('Access token is required.');
  }

  const spinner = yoctoSpinner().start('Validating credentials...');

  try {
    const profile = await fetchStoreProfile(storeHash, accessToken, apiHost);

    spinner.success(`Validated credentials for ${profile.store_name} (${storeHash}).`);
  } catch (error) {
    spinner.error('Failed to validate credentials.');

    const message = error instanceof Error ? error.message : String(error);

    throw new UserActionableError(
      `Could not validate credentials (${message}). Double-check your store hash and access token, then try again.`,
    );
  }

  return { storeHash, accessToken };
}

// Interactive login orchestrator. Used by `catalyst create`, `catalyst auth
// login`, and `catalyst project create` to gather credentials when none are
// supplied via flags/env/config.
//
// Happy path: opens the browser device-code flow. When that fails (e.g. the
// device-code endpoint returns 404 because the OAuth client isn't yet
// provisioned for the user's environment), we ask the user if they'd like to
// fall back to pasting a store-level API account's credentials instead, then
// validate them via the store profile API before returning.
export async function login(loginUrl: string, apiHost: string): Promise<LoginResult> {
  try {
    return await deviceCodeLogin(loginUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    consola.warn(`Browser login didn't work (${message}).`);

    const shouldFallback = await confirm({
      message: 'Try logging in manually with a store hash and access token instead?',
      default: true,
    });

    if (!shouldFallback) {
      throw new LoginAbortedError();
    }

    return manualLogin(apiHost);
  }
}
