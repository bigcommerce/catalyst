import { installDependencies as installDeps } from 'nypm';

import type { PackageManager } from './detect-package-manager';
import { consola } from './logger';

export const installDependencies = async (
  projectDir: string,
  packageManager: PackageManager = 'pnpm',
) => {
  consola.start(`Installing dependencies with ${packageManager}. This could take a minute...`);

  try {
    // NOT silent: nypm routes pnpm/yarn through corepack, which prompts on
    // stdin before downloading a pinned manager version. Silent mode pipes
    // stdio, so that prompt is both invisible and unanswerable — the install
    // hangs forever. Inheriting stdio keeps prompts and progress visible.
    await installDeps({ cwd: projectDir, packageManager });
    consola.success('Dependencies installed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    consola.error(`Failed to install dependencies: ${message}`);
    throw error;
  }
};
