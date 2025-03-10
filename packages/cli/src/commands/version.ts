import chalk from 'chalk';
import { Command } from 'commander';

import PACKAGE_INFO from '../../package.json';

export const version = new Command('version')
  .description('Display detailed version information')
  .action(() => {
    console.log(chalk.cyanBright('\nVersion Information:'));
    console.log(`${chalk.bold('CLI Version:')} ${PACKAGE_INFO.version}`);
    console.log(`${chalk.bold('Node Version:')} ${process.version}`);
    console.log(`${chalk.bold('Platform:')} ${process.platform} (${process.arch})\n`);
  });
