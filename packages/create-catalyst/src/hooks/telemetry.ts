import { Command } from '@commander-js/extra-typings';

import { Telemetry } from '../utils/telemetry/telemetry';

const telemetry = new Telemetry();

export const telemetryPreHook = async (command: Command) => {
  const [commandName] = command.args;

  await telemetry.track(commandName, {});
};

export const telemetryPostHook = async () => {
  await telemetry.analytics.closeAndFlush();
};
