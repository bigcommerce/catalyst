import { Command, Option } from 'commander';
import { z } from 'zod';

import { assertAuthorized, UnauthorizedError } from '../lib/auth-errors';
import { consola } from '../lib/logger';
import { LoginAbortedError, login as runInteractiveLogin } from '../lib/login';
import { fetchProjects } from '../lib/project';
import { getProjectConfig } from '../lib/project-config';
import {
  accessTokenOption,
  apiHostOption,
  loginUrlOption,
  resolveApiHost,
  storeHashOption,
} from '../lib/shared-options';

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

  assertAuthorized(response);

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

// `login` verifies rather than just checking for stored credentials: every other
// command answers a rejected token with "Run `catalyst auth login`", so refusing
// because credentials are merely *present* loops the user back with no way out
// but `auth logout`. `unverifiable` keeps that distinct from a real rejection —
// we can't prove the token is bad, so we don't discard it.
type CredentialStatus =
  | { valid: true; storeName: string }
  | { valid: false; reason: 'unauthorized' }
  | { valid: false; reason: 'unverifiable'; message: string };

async function checkCredentials(
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<CredentialStatus> {
  try {
    const { store_name: storeName } = await fetchStoreProfile(storeHash, accessToken, apiHost);

    return { valid: true, storeName };
  } catch (error) {
    if (error instanceof UnauthorizedError) return { valid: false, reason: 'unauthorized' };

    return {
      valid: false,
      reason: 'unverifiable',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

const whoami = new Command('whoami')
  .configureHelp({ showGlobalOptions: true })
  .description('Verify stored credentials and display store/project info.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst auth whoami

  Logged in to My Store (abc123), connected to project my-project (43eba682-0c48-11f1-9bd5-827a48b0ce1e)`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .action(async (options) => {
    try {
      const config = getProjectConfig();
      const apiHost = resolveApiHost(options, config);

      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');

      if (!storeHash || !accessToken) {
        consola.info('Not logged in: no credentials found.');
        consola.info(
          'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
        );
        process.exit(1);

        return;
      }

      const store = await fetchStoreProfile(storeHash, accessToken, apiHost);

      const projectUuid = config.get('projectUuid');

      if (projectUuid) {
        const projects = await fetchProjects(storeHash, accessToken, apiHost);
        const linkedProject = projects.find((p) => p.uuid === projectUuid);

        if (linkedProject) {
          consola.info(
            `Logged in to ${store.store_name} (${storeHash}), connected to project ${linkedProject.name} (${projectUuid})`,
          );
        } else {
          consola.info(
            `Logged in to ${store.store_name} (${storeHash}), project ${projectUuid} not found`,
          );
        }
      } else {
        consola.info(`Logged in to ${store.store_name} (${storeHash})`);
      }

      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (error instanceof UnauthorizedError) {
        consola.error(
          'Not logged in: your access token is invalid or has expired. Run `catalyst auth login`.',
        );
      } else if (message.includes('401') || message.includes('403')) {
        consola.error(`Not logged in: invalid credentials (${message})`);
      } else {
        consola.error(`Failed to verify credentials: ${message}`);
      }

      process.exit(1);
    }
  });

const login = new Command('login')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Authenticate via browser using the OAuth device code flow. Falls back to an interactive store hash + access token prompt if the browser flow is unavailable. Passing --store-hash and --access-token verifies and stores those credentials instead. If already logged in with credentials that still work, displays them and suggests `catalyst auth logout`; if the stored token has expired or been revoked, re-authenticates in place.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Login interactively (browser, with manual fallback)
  $ catalyst auth login

  # Login with existing credentials (skips interactive flow)
  $ catalyst auth login --store-hash <STORE_HASH> --access-token <ACCESS_TOKEN>

  # Re-authenticate without checking the stored credentials first
  $ catalyst auth login --force`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(loginUrlOption())
  .addOption(
    new Option(
      '--force',
      'Skip the check on any credentials already stored and re-authenticate regardless.',
    ),
  )
  .action(async (options, command) => {
    try {
      const config = getProjectConfig();
      const apiHost = resolveApiHost(options, config);

      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');
      // Both flags typed on the command line. These options also read
      // CATALYST_STORE_HASH/CATALYST_ACCESS_TOKEN, but an exported env var is
      // ambient config and must not turn a plain `auth login` into a silent
      // credential write — only an explicit pair of flags does.
      const suppliedOnCli =
        command.getOptionValueSource('storeHash') === 'cli' &&
        command.getOptionValueSource('accessToken') === 'cli';

      // Non-interactive login: the user named the credentials to use, so verify
      // and persist them rather than reporting on them.
      if (suppliedOnCli && storeHash && accessToken) {
        if (!options.force) {
          const status = await checkCredentials(storeHash, accessToken, apiHost);

          // Opening a browser instead would hide what's wrong with what they passed.
          if (!status.valid && status.reason === 'unauthorized') {
            consola.error(`The credentials provided for store ${storeHash} were rejected.`);
            consola.info(
              'Check the store hash and access token, or run `catalyst auth login` without them to authenticate in the browser.',
            );
            process.exit(1);

            return;
          }

          if (!status.valid) {
            consola.warn(`Couldn't verify the credentials provided: ${status.message}`);
          }
        }

        config.set('storeHash', storeHash);
        config.set('accessToken', accessToken);

        consola.success(`Logged in to store ${storeHash}.`);
        process.exit(0);

        return;
      }

      if (storeHash && accessToken && !options.force) {
        const status = await checkCredentials(storeHash, accessToken, apiHost);

        if (status.valid) {
          consola.info(`Already logged in to ${status.storeName} (${storeHash}).`);
          consola.info(
            'Run `catalyst auth logout` first to re-authenticate, or `catalyst auth login --force` to skip this check.',
          );
          process.exit(0);

          return;
        }

        // The device-code flow needs the same network that just failed, so
        // trading working credentials for another error is a downgrade.
        if (status.reason === 'unverifiable') {
          consola.warn(
            `Found credentials for store ${storeHash} but couldn't verify them: ${status.message}`,
          );
          consola.info(
            'Keeping them. Re-run once the API is reachable, or `catalyst auth login --force` to re-authenticate regardless.',
          );
          process.exit(0);

          return;
        }

        consola.warn(
          `Stored credentials for store ${storeHash} are no longer valid — re-authenticating.`,
        );
      }

      const credentials = await runInteractiveLogin(options.loginUrl, apiHost);

      config.set('storeHash', credentials.storeHash);
      config.set('accessToken', credentials.accessToken);

      consola.success(`Logged in to store ${credentials.storeHash}.`);
      process.exit(0);
    } catch (error) {
      if (error instanceof LoginAbortedError) {
        consola.info(
          'Login aborted. Re-run `catalyst auth login` when you have your credentials ready.',
        );
        process.exit(0);

        return;
      }

      const message = error instanceof Error ? error.message : String(error);

      consola.error(`Login failed: ${message}`);
      process.exit(1);
    }
  });

const logout = new Command('logout')
  .configureHelp({ showGlobalOptions: true })
  .description('Remove stored credentials for the current project.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst auth logout`,
  )
  .action(() => {
    try {
      const config = getProjectConfig();

      const storeHash = config.get('storeHash');
      const accessToken = config.get('accessToken');

      if (!storeHash && !accessToken) {
        consola.info('Not logged in: no credentials found.');
        process.exit(0);

        return;
      }

      config.delete('storeHash');
      config.delete('accessToken');

      consola.success(`Logged out from store ${storeHash ?? 'unknown'}.`);
      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      consola.error(`Logout failed: ${message}`);
      process.exit(1);
    }
  });

export const auth = new Command('auth')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage authentication for the BigCommerce CLI.')
  .addCommand(whoami)
  .addCommand(login)
  .addCommand(logout);
