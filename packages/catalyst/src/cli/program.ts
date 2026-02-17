import { Command } from 'commander';
import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import PACKAGE_INFO from '../../package.json';

import { auth } from './commands/auth';
import { build } from './commands/build';
import { deploy } from './commands/deploy';
import { project } from './commands/project';
import { start } from './commands/start';
import { telemetry } from './commands/telemetry';
import { version } from './commands/version';
import { telemetryPostHook, telemetryPreHook } from './hooks/telemetry';
import { consola } from './lib/logger';

/**
 * Load env file from --env-file in argv before Commander parses.
 * Must run before program.parse() so process.env is populated when
 * Commander reads .env('VAR') for option defaults.
 */
export function loadEnvFileFromArgv(argv: string[]): void {
  const envFileIdx = argv.findIndex((arg) => arg === '--env-file' || arg.startsWith('--env-file='));

  if (envFileIdx === -1) return;

  const arg = argv[envFileIdx];
  const value = arg.startsWith('--env-file=')
    ? arg.slice('--env-file='.length)
    : argv[envFileIdx + 1];

  if (value && !value.startsWith('-')) {
    const resolvedPath = resolve(process.cwd(), value);
    const result = config({ path: resolvedPath, override: true });

    if (result.error) {
      const err = result.error as NodeJS.ErrnoException;
      console.log(result.error?.message);
      console.log(result.error?.name);
      consola.warn(
        err.code === 'ENOENT'
          ? `Env file not found: ${resolvedPath}`
          : `Failed to load --env-file ${value}: ${result.error.message}`,
      );
    }
  }
}

export const program = new Command();

consola.log(colorize('cyanBright', `◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('CLI tool for Catalyst development')
  .option(
    '--env-file <path>',
    'Path to environment file to load (relative to current working directory)',
  )
  .addCommand(version)
  .addCommand(start)
  .addCommand(build)
  .addCommand(deploy)
  .addCommand(project)
  .addCommand(auth)
  .addCommand(telemetry)
  .hook('preAction', telemetryPreHook)
  .hook('postAction', telemetryPostHook);
