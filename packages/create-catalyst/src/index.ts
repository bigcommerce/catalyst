#!/usr/bin/env node

import { Command, Option } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { satisfies } from 'semver';

import PACKAGE_INFO from '../package.json';

import { create } from './commands/create';
import { init } from './commands/init';
import { getLatestCoreTag } from './utils/get-latest-core-tag';
import { getPackageManager, packageManagerChoices } from './utils/pm';

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

export type Options<T> = T extends Command<infer Args, infer Opts> ? [...Args, Opts, T] : never;

const program = new Command()
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('A command line tool to create a new Catalyst project.');

const createCommand = program
  .command('create', { isDefault: true })
  .description('Command to scaffold and connect a Catalyst storefront to your BigCommerce store')
  .option('--project-name <name>', 'Name of your Catalyst project')
  .option('--project-dir <dir>', 'Directory in which to create your project', process.cwd())
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'BigCommerce channel ID')
  .option('--customer-impersonation-token <token>', 'BigCommerce customer impersonation token')
  .addOption(
    new Option(
      '--gh-ref <ref>',
      'Clone a specific ref from the bigcommerce/catalyst repository',
    ).default(getLatestCoreTag),
  )
  .addOption(
    new Option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
      .default('bigcommerce.com')
      .hideHelp(),
  )
  .addOption(
    new Option('--sample-data-api-url <url>', 'BigCommerce sample data API URL')
      .default('https://api.bc-sample.store')
      .hideHelp(),
  )
  .addOption(
    new Option('--package-manager <pm>', 'Override detected package manager')
      .choices(packageManagerChoices)
      .default(getPackageManager())
      .hideHelp(),
  )
  .addOption(
    new Option('--code-editor <editor>', 'Your preferred code editor')
      .choices(['vscode'])
      .default('vscode')
      .hideHelp(),
  )
  .addOption(
    new Option('--include-functional-tests', 'Include the functional test suite')
      .default(false)
      .hideHelp(),
  )
  .action((opts) => create(opts));

export type CreateCommandOptions = Options<typeof createCommand>[0];

const initCommand = program
  .command('init')
  .description('Connect a BigCommerce store with an existing Catalyst project')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .addOption(
    new Option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
      .default('bigcommerce.com')
      .hideHelp(),
  )
  .addOption(
    new Option('--sample-data-api-url <url>', 'BigCommerce sample data API URL')
      .default('https://api.bc-sample.store')
      .hideHelp(),
  )
  .action((opts) => init(opts));

export type InitCommandOptions = Options<typeof initCommand>[0];

program.parse(process.argv);
