import chalk from 'chalk';

import { Telemetry } from './telemetry';

export interface CatalystTelemetryOptions {
  enable?: boolean;
  disable?: boolean;
}

const telemetry = new Telemetry();
let isEnabled = telemetry.isEnabled();

const catalystTelemetry = (options: CatalystTelemetryOptions, arg: string | undefined) => {
  if (options.enable || arg === 'enable') {
    telemetry.setEnabled(true);
    isEnabled = true;

    console.log('Success!');
  } else if (options.disable || arg === 'disable') {
    const path = telemetry.setEnabled(false);

    if (isEnabled) {
      console.log(`Your preference has been saved${path ? ` to ${path}` : ''}`);
    } else {
      console.log(`Catalyst CLI telemetry collection is already disabled.`);
    }

    isEnabled = false;
  } else {
    console.log('Catalyst CLI Telemetry');
  }

  console.log(
    `\nStatus: ${chalk.bold(isEnabled ? chalk.green('Enabled') : chalk.red('Disabled'))}`,
  );

  if (!isEnabled) {
    console.log(
      `\nYou have opted-out of Catalyst CLI telemetry.\nNo data will be collected from your machine.`,
    );
  }
};

export { catalystTelemetry };
