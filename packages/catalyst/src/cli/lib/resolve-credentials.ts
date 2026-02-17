import Conf from 'conf';

import { consola } from './logger';
import { ProjectConfigSchema } from './project-config';

export function resolveCredentials(
  options: { storeHash?: string; accessToken?: string },
  config: Conf<ProjectConfigSchema>,
): { storeHash: string; accessToken: string } {
  const storeHash = options.storeHash ?? config.get('storeHash');
  const accessToken = options.accessToken ?? config.get('accessToken');

  if (!storeHash || !accessToken) {
    consola.error('Missing credentials.');
    consola.info(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );
    process.exit(1);

    // Unreachable in production; prevents continuation when process.exit is mocked in tests.
    throw new Error('Missing credentials');
  }

  return { storeHash, accessToken };
}
