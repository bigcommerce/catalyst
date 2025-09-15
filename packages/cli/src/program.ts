import { Command } from 'commander';
import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import PACKAGE_INFO from '../package.json';

import { build } from './commands/build';
import { deploy } from './commands/deploy';
import { dev } from './commands/dev';
import { link } from './commands/link';
import { start } from './commands/start';
import { telemetry } from './commands/telemetry';
import { version } from './commands/version';
import { telemetryPostHook, telemetryPreHook } from './hooks/telemetry';
import { consola } from './lib/logger';

export const program = new Command();

config({
  path: [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '.env.local'),
    // Assumes the parent directory is the monorepo root:
    resolve(process.cwd(), '..', '.env'),
    resolve(process.cwd(), '..', '.env.local'),
  ],
});

consola.log(colorize('cyanBright', `◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('CLI tool for Catalyst development')
  .addCommand(version)
  .addCommand(dev)
  .addCommand(start)
  .addCommand(build)
  .addCommand(deploy)
  .addCommand(link)
  .addCommand(telemetry)
  .hook('preAction', telemetryPreHook)
  .hook('postAction', telemetryPostHook);
