import { Command } from 'commander';
import { colorize } from 'consola/utils';

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

export const program = new Command();

consola.log(colorize('cyanBright', `◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('CLI tool for Catalyst development')
  .option(
    '--env-file <path>',
    'Path to an environment variable file to load (relative to current directory)',
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
