import { Command } from '@commander-js/extra-typings';

import { Telemetry } from '../lib/telemetry';

const telemetry = new Telemetry();

const allowlistArguments = ['--keep-temp-dir', '--api-host', '--project-uuid'];

function parseArguments(args: string[]) {
  return args.reduce<Record<string, string>>((result, arg, index, array) => {
    if (arg.includes('=')) {
      const [key, value] = arg.split('=');

      if (allowlistArguments.includes(key)) {
        return {
          ...result,
          [key]: value,
        };
      }
    }

    if (allowlistArguments.includes(arg)) {
      const nextValue =
        array[index + 1] && !array[index + 1].startsWith('--') ? array[index + 1] : null;

      if (nextValue && !nextValue.includes('--')) {
        return {
          ...result,
          [arg]: nextValue,
        };
      }
    }

    return result;
  }, {});
}

export const telemetryPreHook = async (command: Command) => {
  const [commandName, ...args] = command.args;

  // Return the await to get a proper stack trace.
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  return await telemetry.track(commandName, {
    ...parseArguments(args),
  });
};

export const telemetryPostHook = async () => {
  await telemetry.analytics.closeAndFlush();
};
