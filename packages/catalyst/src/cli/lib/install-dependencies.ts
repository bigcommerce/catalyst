import { execa } from 'execa';
import yoctoSpinner from 'yocto-spinner';

import type { PackageManager } from './detect-package-manager';

// Run the package manager by name, the same `pnpm` / `npm` / `yarn` the user
// runs next. Not nypm: it installs through `corepack <manager>` when corepack is
// available, and corepack picks its cached default version, not the user's.
//
// NODE_NO_WARNINGS keeps Node's warning flood out of the captured output, and
// COREPACK_ENABLE_DOWNLOAD_PROMPT stops a corepack shim on PATH from waiting on
// a download prompt.
export const installDependencies = async (
  projectDir: string,
  packageManager: PackageManager = 'pnpm',
) => {
  const spinner = yoctoSpinner().start(
    `Installing dependencies with ${packageManager}. This could take a minute...`,
  );

  try {
    await execa(packageManager, ['install'], {
      cwd: projectDir,
      stdin: 'ignore',
      env: { NODE_NO_WARNINGS: '1', COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' },
    });
    spinner.success('Dependencies installed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    spinner.error(`Failed to install dependencies: ${message}`);
    throw error;
  }
};
