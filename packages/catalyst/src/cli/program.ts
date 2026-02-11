import { Command } from 'commander';
import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import PACKAGE_INFO from '../../package.json';

import { auth } from './commands/auth';
import { build } from './commands/build';
import { deploy } from './commands/deploy';
import { dev } from './commands/dev';
import { project } from './commands/project';
import { start } from './commands/start';
import { telemetry } from './commands/telemetry';
import { version } from './commands/version';
import { telemetryPostHook, telemetryPreHook } from './hooks/telemetry';
import { consola } from './lib/logger';

export const program = new Command();

function loadEnvFilePreHook(thisCommand: Command) {
  let root: typeof thisCommand | undefined = thisCommand;

  while (root.parent) {
    root = root.parent as typeof thisCommand;
  }

  const opts = root.opts() as { envFile?: string };
  const envFile = opts.envFile;

  if (envFile) {
    const resolvedPath = resolve(process.cwd(), envFile);

    config({ path: resolvedPath, override: true });
  }
}

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
  .addCommand(dev)
  .addCommand(start)
  .addCommand(build)
  .addCommand(deploy)
  .addCommand(project)
  .addCommand(auth)
  .addCommand(telemetry)
  .hook('preAction', loadEnvFilePreHook)
  .hook('preAction', telemetryPreHook)
  .hook('postAction', telemetryPostHook);
