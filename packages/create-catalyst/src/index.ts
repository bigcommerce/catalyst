#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';
import chalk from 'chalk';

import PACKAGE_INFO from '../package.json';
import { createContainer } from './container';
import { CreateCommandOptions, InitCommandOptions, TelemetryCommandOptions } from './types';

console.log(chalk.cyanBright(`\n◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

const container = createContainer({
  bigCommerceHostname: 'bigcommerce.com',
  sampleDataApiUrl: 'https://api.bc-sample.store',
});

const projectService = container.getProjectService();

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .description('A command line tool to create a new Catalyst project.');

program
  .command('create')
  .description('Create a new Catalyst project')
  .option('--project-name <name>', 'Name of your Catalyst project')
  .option('--project-dir <dir>', 'Directory in which to create your project', process.cwd())
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'BigCommerce channel ID')
  .option('--storefront-token <token>', 'BigCommerce storefront token')
  .option('--gh-ref <ref>', 'Clone a specific ref from the source repository')
  .option('--reset-main', 'Reset the main branch to the gh-ref')
  .option('--repository <repository>', 'GitHub repository to clone from', 'bigcommerce/catalyst')
  .option('--env <vars...>', 'Arbitrary environment variables to set in .env.local')
  .option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname', 'bigcommerce.com')
  .option('--sample-data-api-url <url>', 'BigCommerce sample data API URL', 'https://api.bc-sample.store')
  .action(async (options: CreateCommandOptions) => {
    try {
      await projectService.create(options);
    } catch (error) {
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Connect a BigCommerce store with an existing Catalyst project')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname', 'bigcommerce.com')
  .option('--sample-data-api-url <url>', 'BigCommerce sample data API URL', 'https://api.bc-sample.store')
  .action(async (options: InitCommandOptions) => {
    try {
      await projectService.init(options);
    } catch (error) {
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n`));
      process.exit(1);
    }
  });

program
  .command('telemetry')
  .description('Manage telemetry settings')
  .argument('[arg]', 'enable, disable, or status')
  .option('--enable', 'Enables CLI telemetry collection')
  .option('--disable', 'Disables CLI telemetry collection')
  .action((arg: string | undefined, options: TelemetryCommandOptions) => {
    // TODO: Implement telemetry service
    console.log('Telemetry settings updated');
  });

program.parse(process.argv);
