#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { satisfies } from 'semver';

import PACKAGE_INFO from '../package.json';

import { create } from './commands/create';
import { init } from './commands/init';

if (!satisfies(process.version, PACKAGE_INFO.engines.node)) {
  console.error(
    chalk.red(
      `\nYou are using Node.js ${process.version}. Catalyst requires ${PACKAGE_INFO.engines.node}. Please upgrade your Node.js version to continue.\n`,
    ),
  );
  console.log(
    chalk.yellow(
      'Tip: If you use nvm, you can run `nvm install 18` to install a compatible node version.\n',
    ),
  );
  process.exit(1);
}

console.log(chalk.cyanBright(`\n◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('A command line tool to create a new Catalyst project.')
  .addCommand(create, { isDefault: true })
  .addCommand(init);

program.parse(process.argv);
