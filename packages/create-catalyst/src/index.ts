#!/usr/bin/env node
import { program } from '@commander-js/extra-typings';
import chalk from 'chalk';

import PACKAGE_INFO from '../package.json';

import { createContainer } from './container';
import { CreateCommandOptions, InitCommandOptions } from './types';

console.log(chalk.cyanBright(`\n◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

const container = createContainer({
  bigCommerceHostname: 'bigcommerce.com',
  cliApiHostname: 'cxm-prd.bigcommerceapp.com',
});

const projectService = container.getProjectService();

program
  .name(PACKAGE_INFO.name)
  .description('A command line tool to create a new Catalyst project')
  .version(PACKAGE_INFO.version);

program
  .command('create')
  .description('Create a new Catalyst project')
  .argument('[project-name]', 'Name of the project')
  .option('--project-dir <dir>', 'Directory to create the project in')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'BigCommerce channel ID')
  .option('--storefront-token <token>', 'BigCommerce storefront token')
  .option('--gh-ref <ref>', 'Git reference to use')
  .option('--reset-main', 'Reset main branch to specified ref')
  .option('--repository <repo>', 'Repository to clone from')
  .option('--env <env...>', 'Environment variables to set')
  .option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
  .option('--sample-data-api-url <url>', 'Sample data API URL')
  .option('--cli-api-hostname <hostname>', 'CLI API hostname')
  .action(async (projectName: string | undefined, options: CreateCommandOptions) => {
    try {
      await projectService.create({ projectName, ...options });
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      } else {
        console.error(chalk.red('An unknown error occurred'));
      }

      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a Catalyst project')
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--bigcommerce-hostname <hostname>', 'BigCommerce hostname')
  .option('--sample-data-api-url <url>', 'Sample data API URL')
  .option('--cli-api-hostname <hostname>', 'CLI API hostname')
  .action(async (options: InitCommandOptions) => {
    try {
      await projectService.init(options);
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      } else {
        console.error(chalk.red('An unknown error occurred'));
      }

      process.exit(1);
    }
  });

program
  .command('telemetry')
  .description('Manage telemetry settings')
  .option('--enable', 'Enables CLI telemetry collection')
  .option('--disable', 'Disables CLI telemetry collection')
  .action(() => {
    // TODO: Implement telemetry service
    console.log('Telemetry settings updated');
  });

program.parse(process.argv);
