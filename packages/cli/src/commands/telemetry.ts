import { Argument, Command, Option } from 'commander';
import consola from 'consola';
import { colorize } from 'consola/utils';

import { Telemetry } from '../lib/telemetry';

const telemetryService = new Telemetry();
let isEnabled = telemetryService.isEnabled();

export const telemetry = new Command('telemetry')
  .addArgument(new Argument('[arg]').choices(['disable', 'enable', 'status']))
  .addOption(new Option('--enable', `Enables CLI telemetry collection.`).conflicts('disable'))
  .option('--disable', `Disables CLI telemetry collection.`)
  .action((arg, options) => {
    if (options.enable || arg === 'enable') {
      telemetryService.setEnabled(true);
      isEnabled = true;

      consola.success('Success!\n');
    } else if (options.disable || arg === 'disable') {
      telemetryService.setEnabled(false);

      if (isEnabled) {
        consola.success('Your preference has been saved to .bigcommerce/project.json');
      } else {
        consola.info(`Catalyst CLI telemetry collection is already disabled.`);
      }

      isEnabled = false;
    } else {
      consola.info('Catalyst CLI Telemetry\n');
    }

    consola.info(
      `Status: ${colorize('bold', isEnabled ? colorize('green', 'Enabled') : colorize('red', 'Disabled'))}`,
    );

    if (!isEnabled) {
      consola.info(
        `You have opted-out of Catalyst CLI telemetry. No data will be collected from your machine.`,
      );
    }
  });
