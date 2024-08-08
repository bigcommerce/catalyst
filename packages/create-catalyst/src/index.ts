#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';
import chalk from 'chalk';

import PACKAGE_INFO from '../package.json';

import { create } from './commands/create';
import { init } from './commands/init';
import { integration } from './commands/integration';

console.log(chalk.cyanBright(`\n◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('A command line tool to create a new Catalyst project.')
  .addCommand(create, { isDefault: true })
  .addCommand(init)
  .addCommand(integration);

program.parse(process.argv);
