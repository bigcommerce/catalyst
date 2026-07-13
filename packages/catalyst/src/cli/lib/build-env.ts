import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { UserActionableError } from './errors';
import { consola } from './logger';

// Conventional env files auto-loaded (in precedence order) for the build when
// `--env-path` isn't given. `.env.local` wins over `.env`, and neither
// overrides values already present in the real environment — matching Next.js
// precedence (process.env > .env.local > .env).
const AUTO_ENV_FILES = ['.env.local', '.env'] as const;

interface LoadBuildEnvOptions {
  // Explicit env file passed via `--env-path`. When set, only this file is
  // loaded (and it overrides existing values); when unset, the conventional
  // files above are auto-loaded instead.
  envPath?: string;
  // Directory the paths are resolved against. Defaults to the current working
  // directory; injectable for tests.
  cwd?: string;
}

// Loads storefront environment variables into `process.env` for the
// build/deploy pipeline so the spawned build (and the checks that run before
// it) can see them. This is intentionally scoped to `build` and `deploy`: no
// other command loads env files, so running the CLI can't be surprised by a
// stray `.env.local` on disk.
export function loadBuildEnv({ envPath, cwd = process.cwd() }: LoadBuildEnvOptions): void {
  if (envPath !== undefined) {
    const envFilePath = resolve(cwd, envPath);
    const result = config({ path: envFilePath, override: true });

    if (result.error) {
      const errCode =
        'code' in result.error && typeof result.error.code === 'string'
          ? result.error.code
          : undefined;
      const message =
        errCode === 'ENOENT'
          ? `Env file not found: ${envFilePath}`
          : `Failed to load --env-path ${envPath}: ${result.error.message}`;

      throw new UserActionableError(message);
    }

    consola.log(colorize('cyanBright', `Loaded environment variables from ${envFilePath}\n`));

    return;
  }

  // Auto-load the conventional files. `.env.local` is loaded first so it takes
  // precedence over `.env`; `override: false` means the real environment always
  // wins over both. Missing files are expected and ignored.
  const loaded = AUTO_ENV_FILES.filter((file) => {
    const envFilePath = resolve(cwd, file);

    if (!existsSync(envFilePath)) {
      return false;
    }

    return !config({ path: envFilePath, override: false }).error;
  });

  if (loaded.length > 0) {
    consola.log(colorize('cyanBright', `Loaded environment variables from ${loaded.join(', ')}\n`));
  }
}
