import chalk from 'chalk';
import { Command } from 'commander';

import PACKAGE_INFO from '../package.json';

import { build } from './commands/build';
import { version } from './commands/version';

export const program = new Command();

console.log(chalk.cyanBright(`\n◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('CLI tool for Catalyst development')
  .addCommand(version)
  .addCommand(build);
