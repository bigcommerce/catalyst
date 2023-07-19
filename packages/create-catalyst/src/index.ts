#!/usr/bin/env node

import { Command } from 'commander';

import pkg from '../package.json';

import { create } from './create';

const program = new Command();

program
  .name('npm create @bigcommerce/catalyst') // shows in "usage" for --help option
  .description('The official command-line tool to create a new Catalyst storefront.')
  .version(pkg.version)
  .argument('<name>', '(required) name of the folder in which to create your Catalyst project')
  .action(create);

program.parse();
