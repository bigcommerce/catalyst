import chalk from 'chalk';
import { Command } from 'commander';
import consola from 'consola';

import PACKAGE_INFO from '../../package.json';

export const version = new Command('version')
  .description('Display detailed version information.')
  .action(() => {
    consola.log(chalk.cyanBright('\nVersion Information:'));
    consola.log(`${chalk.bold('CLI Version:')} ${PACKAGE_INFO.version}`);
    consola.log(`${chalk.bold('Node Version:')} ${process.version}`);
    consola.log(`${chalk.bold('Platform:')} ${process.platform} (${process.arch})\n`);
  });
