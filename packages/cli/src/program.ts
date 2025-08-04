import { Command } from 'commander';
import consola from 'consola';
import { colorize } from 'consola/utils';

import PACKAGE_INFO from '../package.json';

import { build } from './commands/build';
import { deploy } from './commands/deploy';
import { dev } from './commands/dev';
import { link } from './commands/link';
import { start } from './commands/start';
import { version } from './commands/version';

export const program = new Command();

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
  .addCommand(link);
