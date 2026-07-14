import { installDependencies as installDeps } from 'nypm';
import yoctoSpinner from 'yocto-spinner';

import type { PackageManager } from './detect-package-manager';

// Restore an env var to a captured previous value, unsetting it when it wasn't
// set before (a plain assignment can't represent "absent").
const restoreEnv = (key: string, previous: string | undefined) => {
  if (previous === undefined) {
    Reflect.deleteProperty(process.env, key);
  } else {
    process.env[key] = previous;
  }
};

// nypm runs the install through tinyexec, which in silent mode drains the
// child's stdout to completion BEFORE it starts reading stderr. pnpm sends its
// progress to stdout but floods stderr with Node warnings — on Node 26 the
// `File descriptor N opened in unmanaged mode` spam alone is thousands of
// lines. That stderr fills its ~64KB pipe buffer while tinyexec is still busy
// on stdout, pnpm blocks writing, and the whole install deadlocks (the original
// "hangs forever" bug). These env vars keep the child quiet on stderr so the
// buffer never fills:
//   - NODE_NO_WARNINGS: drop pnpm/corepack's internal Node warnings (the flood).
//   - COREPACK_ENABLE_DOWNLOAD_PROMPT: never block on corepack's download
//     confirmation (defensive; corepack already defaults this off for the
//     `corepack pnpm` entrypoint, but pin it so no path can stall on stdin).
const withQuietInstallEnv = async <T>(run: () => Promise<T>): Promise<T> => {
  const prevNodeNoWarnings = process.env.NODE_NO_WARNINGS;
  const prevDownloadPrompt = process.env.COREPACK_ENABLE_DOWNLOAD_PROMPT;

  process.env.NODE_NO_WARNINGS ??= '1';
  process.env.COREPACK_ENABLE_DOWNLOAD_PROMPT ??= '0';

  try {
    return await run();
  } finally {
    restoreEnv('NODE_NO_WARNINGS', prevNodeNoWarnings);
    restoreEnv('COREPACK_ENABLE_DOWNLOAD_PROMPT', prevDownloadPrompt);
  }
};

export const installDependencies = async (
  projectDir: string,
  packageManager: PackageManager = 'pnpm',
) => {
  const spinner = yoctoSpinner().start(
    `Installing dependencies with ${packageManager}. This could take a minute...`,
  );

  try {
    await withQuietInstallEnv(() => installDeps({ cwd: projectDir, silent: true, packageManager }));
    spinner.success('Dependencies installed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    spinner.error(`Failed to install dependencies: ${message}`);
    throw error;
  }
};
