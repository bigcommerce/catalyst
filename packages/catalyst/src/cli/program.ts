import { Command } from 'commander';
import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import PACKAGE_INFO from '../../package.json';

import { build } from './commands/build';
import { deploy } from './commands/deploy';
import { dev } from './commands/dev';
import { project } from './commands/project';
import { start } from './commands/start';
import { telemetry } from './commands/telemetry';
import { version } from './commands/version';
import { telemetryPostHook, telemetryPreHook } from './hooks/telemetry';
import { consola } from './lib/logger';

/**
 * Config/environment variable resolution order (highest to lowest priority):
 * 1. Individual parameter flags (e.g. --store-hash)
 * 2. --env-file (loaded into process.env before parsing, overrides existing)
 * 3. process.env (shell / existing environment)
 * 4. .bigcommerce/project.json
 */
export function loadEnvFileFromArgv(argv: string[]): void {
  const envFileIdx = argv.findIndex((arg) => arg === '--env-file' || arg.startsWith('--env-file='));

  if (envFileIdx === -1) return;

  const arg = argv[envFileIdx];
  const value =
    arg.startsWith('--env-file=') ? arg.slice('--env-file='.length) : argv[envFileIdx + 1];

  if (value) {
    config({ path: resolve(process.cwd(), value), override: true });
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
    'Path to environment file to load (relative to current working directory). Loaded before other env sources; overrides process.env.',
  )
  .addCommand(version)
  .addCommand(dev)
  .addCommand(start)
  .addCommand(build)
  .addCommand(deploy)
  .addCommand(project)
  .addCommand(telemetry)
  .hook('preAction', telemetryPreHook)
  .hook('postAction', telemetryPostHook);
