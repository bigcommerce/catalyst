import { Command } from '@commander-js/extra-typings';

import { Telemetry } from '../utils/telemetry/telemetry';

const telemetry = new Telemetry();

const allowlistArguments = ['--gh-ref', '--repository', '--project-name'];

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
  // @ts-expect-error _name is a private property
  const availableCommands = command.commands.map((cmd) => cmd._name); // eslint-disable-line @typescript-eslint/no-unsafe-return, no-underscore-dangle

  const [commandName = 'create', ...args] = command.args;

  // When running `npm create @bigcommerce/catalyst`, the command defaults to
  // the `create` command but commander doesn't pass it as part of the arguments.
  //  We need to handle this case separately.
  if (!availableCommands.includes(commandName)) {
    // Return the await to get a proper stack trace.
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    return await telemetry.track('create', {
      ...parseArguments(args),
    });
  }

  // Return the await to get a proper stack trace.
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  return await telemetry.track(commandName, {
    ...parseArguments(args),
  });
};

export const telemetryPostHook = async () => {
  await telemetry.analytics.closeAndFlush();
};
