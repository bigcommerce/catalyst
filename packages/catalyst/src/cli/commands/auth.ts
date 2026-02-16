import { Command, Option } from 'commander';
import { z } from 'zod';

import { consola } from '../lib/logger';
import { fetchProjects } from '../lib/project';
import { getProjectConfig } from '../lib/project-config';

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
  const { data } = StoreProfileSchema.parse(res);

  return data;
}

const whoami = new Command('whoami')
  .description('Verify stored credentials and display store/project info.')
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .action(async (options) => {
    try {
      const config = getProjectConfig();

      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');

      if (!storeHash || !accessToken) {
        consola.info('Not logged in: no credentials found.');
        consola.info(
          'Provide --store-hash and --access-token flags, set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables, or run `catalyst project create` / `catalyst project link` with credentials.',
        );
        process.exit(1);

        return;
      }

      const store = await fetchStoreProfile(storeHash, accessToken, options.apiHost);

      const projectUuid = config.get('projectUuid');

      if (projectUuid) {
        const projects = await fetchProjects(storeHash, accessToken, options.apiHost);
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

      if (message.includes('401') || message.includes('403')) {
        consola.error(`Not logged in: invalid credentials (${message})`);
      } else {
        consola.error(`Failed to verify credentials: ${message}`);
      }

      process.exit(1);
    }
  });

export const auth = new Command('auth')
  .description('Manage authentication for the BigCommerce CLI.')
  .addCommand(whoami);
