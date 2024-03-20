import chalk from 'chalk';
import { addDependency, addDevDependency, installDependencies as installDeps } from 'nypm';

import { type PackageManager } from './pm';
import { spinner } from './spinner';

const installAllDeps = async (projectDir: string, packageManager: PackageManager) => {
  await installDeps({ cwd: projectDir, silent: true, packageManager });
  await addDependency('@bigcommerce/catalyst-client', {
    cwd: projectDir,
    silent: true,
    packageManager,
  });
  await addDevDependency('@bigcommerce/eslint-config-catalyst', {
    cwd: projectDir,
    silent: true,
    packageManager,
  });
};

export const installDependencies = async (projectDir: string, packageManager: PackageManager) =>
  spinner(installAllDeps(projectDir, packageManager), {
    text: `Installing dependencies. This could take a minute...`,
    successText: `Dependencies installed successfully`,
    failText: (err) => chalk.red(`Failed to install dependencies: ${err.message}`),
  });
