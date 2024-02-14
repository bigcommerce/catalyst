import chalk from 'chalk';
import { installDependencies as installDeps } from 'nypm';

import { type PackageManager } from './pm.js';
import { spinner } from './spinner.js';

export const installDependencies = async (projectDir: string, packageManager: PackageManager) =>
  spinner(installDeps({ cwd: projectDir, silent: true, packageManager }), {
    text: `Installing dependencies. This could take a minute...`,
    successText: `Dependencies installed successfully`,
    failText: (err) => chalk.red(`Failed to install dependencies: ${err.message}`),
  });
