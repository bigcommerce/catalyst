import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import { consola } from './logger';

/**
 * Parse --env-path from argv and load the specified env file into process.env
 * before Effect CLI processes options.
 *
 * This runs outside the CLI framework to maintain the correct priority order:
 *   1. CLI flags (--store-hash, etc.)
 *   2. --env-path file
 *   3. process.env
 *   4. .bigcommerce/project.json
 *
 * Returns argv with --env-path and its value stripped out so the CLI
 * framework does not see an unknown option.
 */
export function loadEnvFile(argv: string[]): string[] {
  const envPathIndex = argv.indexOf('--env-path');

  if (envPathIndex === -1) {
    return argv;
  }

  const value = argv[envPathIndex + 1];

  if (!value) {
    return argv;
  }

  const envFilePath = resolve(process.cwd(), value);
  const result = config({ path: envFilePath, override: true });

  if (result.error) {
    const errCode =
      'code' in result.error && typeof result.error.code === 'string'
        ? result.error.code
        : undefined;
    const message =
      errCode === 'ENOENT'
        ? `Env file not found: ${envFilePath}`
        : `Failed to load --env-path ${value}: ${result.error.message}`;

    throw new Error(message);
  }

  consola.log(colorize('cyanBright', `Loaded environment variables from ${envFilePath}\n`));

  return [...argv.slice(0, envPathIndex), ...argv.slice(envPathIndex + 2)];
}
