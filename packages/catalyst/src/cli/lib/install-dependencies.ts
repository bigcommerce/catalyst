import { installDependencies as installDeps } from 'nypm';
import yoctoSpinner from 'yocto-spinner';

import type { PackageManager } from './detect-package-manager';

export const installDependencies = async (
  projectDir: string,
  packageManager: PackageManager = 'pnpm',
) => {
  const spinner = yoctoSpinner().start(
    `Installing dependencies with ${packageManager}. This could take a minute...`,
  );

  try {
    await installDeps({ cwd: projectDir, silent: true, packageManager });
    spinner.success('Dependencies installed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    spinner.error(`Failed to install dependencies: ${message}`);
    throw error;
  }
};
