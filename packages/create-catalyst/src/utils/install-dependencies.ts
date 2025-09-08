import ansis from 'ansis';
import { installDependencies as installDeps } from 'nypm';

import { spinner } from './spinner';

const installAllDeps = async (projectDir: string) => {
  await installDeps({ cwd: projectDir, silent: true, packageManager: 'pnpm' });
};

export const installDependencies = async (projectDir: string) =>
  spinner(installAllDeps(projectDir), {
    text: `Installing dependencies. This could take a minute...`,
    successText: `Dependencies installed successfully`,
    failText: (err) => ansis.red(`Failed to install dependencies: ${err.message}`),
  });
