import { Command } from '@commander-js/extra-typings';

import { Telemetry } from '../utils/telemetry/telemetry';

const telemetry = new Telemetry();

export const telemetryPreHook = async (command: Command) => {
  // If the binary is ran without a command, the command.args will be an empty array.
  // When running `npm create @bigcommerce/catalyst`, npm runs the binary with no args passed,
  // but the program defaults to the `create` command.
  const [commandName = 'create'] = command.args;

  await telemetry.track(commandName, {});
};

export const telemetryPostHook = async () => {
  await telemetry.analytics.closeAndFlush();
};
