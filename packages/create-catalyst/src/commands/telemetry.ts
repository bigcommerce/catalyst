import { Argument, Command, Option } from '@commander-js/extra-typings';

import { catalystTelemetry, CatalystTelemetryOptions } from '../utils/telemetry';

export const telemetry = new Command('telemetry')
  .addArgument(new Argument('[arg]').choices(['disable', 'enable', 'status']))
  .addOption(new Option('--enable', `Enables CLI telemetry collection.`).conflicts('disable'))
  .option('--disable', `Disables CLI telemetry collection.`)
  .action((arg: string | undefined, options: CatalystTelemetryOptions) =>
    catalystTelemetry(options, arg),
  );
