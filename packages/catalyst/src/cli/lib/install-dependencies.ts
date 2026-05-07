import { installDependencies as installDeps } from 'nypm';
import yoctoSpinner from 'yocto-spinner';

export const installDependencies = async (projectDir: string) => {
  const spinner = yoctoSpinner().start('Installing dependencies. This could take a minute...');

  try {
    await installDeps({ cwd: projectDir, silent: true, packageManager: 'pnpm' });
    spinner.success('Dependencies installed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    spinner.error(`Failed to install dependencies: ${message}`);
    throw error;
  }
};
