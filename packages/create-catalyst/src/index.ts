#!/usr/bin/env node

import chalk from 'chalk';
import { Command, Option } from 'commander';

import PACKAGE_INFO from '../package.json';

import { create } from './commands/create.js';
import { init } from './commands/init.js';

console.log(chalk.cyanBright(`\n◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

const program = new Command();

const projectName = new Option('--projectName <name>', 'Project name').env('PROJECT_NAME');

const projectDir = new Option('--projectDir <path>', 'Project installation directory').env(
  'PROJECT_DIR',
);

const bigCommerceHostname = new Option('--bigCommerceHostname <hostname>', 'BigCommerce Hostname')
  .default('bigcommerce.com')
  .env('BIGCOMMERCE_HOSTNAME')
  .hideHelp();

const sampleDataApiUrl = new Option('--sampleDataApiUrl <url>', 'Sample Data API URL')
  .default('https://api.bc-sample.store')
  .env('SAMPLE_DATA_URL')
  .hideHelp();

const packageManager = new Option('--packageManager <pm>', 'Package manager to use')
  .env('PACKAGE_MANAGER')
  .hideHelp();

const ghRef = new Option(
  '--ghRef <url>',
  'Clone a specific ref from the bigcommerce/catalyst repository',
)
  .default('main')
  .env('GH_REF')
  .hideHelp();

const storeHash = new Option('--storeHash <hash>', 'BigCommerce store hash').env(
  'BIGCOMMERCE_STORE_HASH',
);

const accessToken = new Option('--accessToken <token>', 'BigCommerce access token').env(
  'BIGCOMMERCE_ACCESS_TOKEN',
);

const channelId = new Option('--channelId <id>', 'BigCommerce channel ID').env(
  'BIGCOMMERCE_CHANNEL_ID',
);

const customerImpersonationToken = new Option(
  '--customerImpersonationToken <token>',
  'BigCommerce customer impersonation token',
).env('BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN');

program
  .name(PACKAGE_INFO.name)
  .description('A command line tool to create a new Catalyst project.')
  .version(PACKAGE_INFO.version);

program
  .command('create', { isDefault: true })
  .description('Command to scaffold and connect a Catalyst storefront to your BigCommerce store')
  .addOption(projectName)
  .addOption(projectDir)
  .addOption(channelId)
  .addOption(customerImpersonationToken)
  .addOption(bigCommerceHostname)
  .addOption(sampleDataApiUrl)
  .addOption(packageManager)
  .addOption(ghRef)
  .addOption(storeHash)
  .addOption(accessToken)
  .action((opts) => create(opts));

program
  .command('init')
  .description('Connect a BigCommerce store with an existing Catalyst project')
  .addOption(bigCommerceHostname)
  .addOption(sampleDataApiUrl)
  .addOption(storeHash)
  .addOption(accessToken)
  .action((opts) => init(opts));

program.parse(process.argv);
