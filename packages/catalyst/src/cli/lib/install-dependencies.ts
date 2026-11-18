import { execa } from 'execa';
import yoctoSpinner from 'yocto-spinner';

import type { PackageManager } from './detect-package-manager';

// Run the package manager by name, so the install uses the same binary as the
// user's later commands.
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
      // Silence Node warnings and never wait on a corepack download prompt.
      env: { NODE_NO_WARNINGS: '1', COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' },
    });
    spinner.success('Dependencies installed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    spinner.error(`Failed to install dependencies: ${message}`);
    throw error;
  }
};
