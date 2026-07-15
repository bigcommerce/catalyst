import { Command } from 'commander';
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
    'Authenticate via browser using the OAuth device code flow. Falls back to an interactive store hash + access token prompt if the browser flow is unavailable. If already logged in, displays current credentials and suggests running `catalyst auth logout` to re-authenticate.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Login interactively (browser, with manual fallback)
  $ catalyst auth login

  # Login with existing credentials (skips interactive flow)
  $ catalyst auth login --store-hash <STORE_HASH> --access-token <ACCESS_TOKEN>`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(loginUrlOption())
  .action(async (options) => {
    try {
      const config = getProjectConfig();
      const apiHost = resolveApiHost(options, config);

      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');

      if (storeHash && accessToken) {
        consola.info(`Already logged in to store ${storeHash}.`);
        consola.info('Run `catalyst auth logout` first to re-authenticate.');
        process.exit(0);

        return;
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
