import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { consola } from '../lib/logger';

export async function mkTempDir(prefix = '/') {
  const tmp = join(tmpdir(), prefix);

  const path = await mkdtemp(tmp);

  consola.info(`Created temporary directory: ${path}`);

  return [
    path,
    async () => {
      try {
        consola.info(`Cleaning up temporary directory: ${path}`);
        await rm(path, { recursive: true, force: true });
        consola.success('Cleanup complete');
      } catch (error) {
        consola.warn(`Failed to clean up temporary directory: ${path}`, error);
      }
    },
  ] as const;
}
