import type { Command } from 'commander';
import { colorize } from 'consola/utils';
import { config, parse } from 'dotenv';
import { expand } from 'dotenv-expand';
import { existsSync, readFileSync } from 'node:fs';
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
//
// Returns the `--env-path` file's variables so the build can use that file
// alone; returns undefined when the conventional files were auto-loaded.
export function loadBuildEnv({
  envPath,
  cwd = process.cwd(),
}: LoadBuildEnvOptions): Record<string, string> | undefined {
  if (envPath !== undefined) {
    const envFilePath = resolve(cwd, envPath);
    const fileVars = readEnvFile(envFilePath, envPath);

    // Next.js won't read env files (and so won't expand `$VAR` references) when
    // `--env-path` is given, so expand them here, matching what it would do.
    const { parsed = {} } = expandOverriding(fileVars);

    consola.log(colorize('cyanBright', `Loaded environment variables from ${envFilePath}\n`));

    return parsed;
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

  return undefined;
}

function readEnvFile(envFilePath: string, envPath: string): Record<string, string> {
  try {
    return parse(readFileSync(envFilePath));
  } catch (error) {
    const message =
      error instanceof Error && 'code' in error && error.code === 'ENOENT'
        ? `Env file not found: ${envFilePath}`
        : `Failed to load --env-path ${envPath}: ${error instanceof Error ? error.message : String(error)}`;

    throw new UserActionableError(message);
  }
}

// Whether `aliasStoreHash` set CATALYST_STORE_HASH, as opposed to the user.
export const storeHashAlias = { applied: false };

// CATALYST_STORE_HASH falls back to BIGCOMMERCE_STORE_HASH so freshly-scaffolded
// projects work without duplicating the same value under two names.
export function aliasStoreHash(): void {
  if (!process.env.CATALYST_STORE_HASH && process.env.BIGCOMMERCE_STORE_HASH) {
    process.env.CATALYST_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
    storeHashAlias.applied = true;
  }
}

// Expands `vars` into `process.env`, overriding existing values. dotenv-expand
// keeps a value already in `process.env`, and a self-reference such as
// `X=${X:-default}` preloaded there recurses forever, so drop the keys first.
function expandOverriding(vars: Record<string, string>) {
  Object.keys(vars).forEach((key) => Reflect.deleteProperty(process.env, key));

  return expand({ parsed: vars });
}

function stringEntries(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

// The environment `loadBuildEnv` would produce, without keeping changes to
// `process.env`: dotenv-expand v10 only resolves references against it, so
// expand against it and restore it after. Auto-loaded values are expanded
// here too, since only Next.js expands them during the build.
export function readBuildEnv({
  envPath,
  cwd = process.cwd(),
}: LoadBuildEnvOptions): Record<string, string> {
  const shell = stringEntries(process.env);
  const fileVars =
    envPath !== undefined
      ? readEnvFile(resolve(cwd, envPath), envPath)
      : Object.fromEntries(
          AUTO_ENV_FILES.toReversed()
            .map((file) => resolve(cwd, file))
            .filter((file) => existsSync(file))
            .flatMap((file) => Object.entries(parse(readFileSync(file))))
            .filter(([key]) => !(key in shell)),
        );

  try {
    expandOverriding({ ...fileVars });

    const env = stringEntries(process.env);

    // Follow the file's BIGCOMMERCE_STORE_HASH unless CATALYST_STORE_HASH was
    // set by the user rather than by `aliasStoreHash`.
    const aliased = !('CATALYST_STORE_HASH' in shell) || storeHashAlias.applied;

    if (aliased && !('CATALYST_STORE_HASH' in fileVars) && env.BIGCOMMERCE_STORE_HASH) {
      env.CATALYST_STORE_HASH = env.BIGCOMMERCE_STORE_HASH;
    }

    return env;
  } finally {
    Object.keys(process.env)
      .filter((key) => !(key in shell))
      .forEach((key) => Reflect.deleteProperty(process.env, key));
    Object.assign(process.env, shell);
  }
}

// Commander resolves `.env()` option fallbacks (CATALYST_PROJECT_UUID, ...)
// while parsing, before the action reads the env file. Re-resolve them from
// `readBuildEnv` so values from the file apply. Flags still win.
export function applyEnvFileOptions(command: Command, env: Record<string, string>): void {
  command.options.forEach((option) => {
    const key = option.attributeName();
    const value = option.envVar ? env[option.envVar] : undefined;

    if (value && command.getOptionValueSource(key) !== 'cli') {
      command.setOptionValueWithSource(key, value, 'env');
    }
  });
}
