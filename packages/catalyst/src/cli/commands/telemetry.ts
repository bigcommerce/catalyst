import { Args, Command, Options } from '@effect/cli';
import { colorize } from 'consola/utils';
import { Effect, Option } from 'effect';

import { Logger } from '../presentation/services/Logger';
import { Telemetry } from '../providers/services/Telemetry';

const telemetryArg = Args.choice([
  ['disable', 'disable'] as const,
  ['enable', 'enable'] as const,
  ['status', 'status'] as const,
]).pipe(Args.optional);

const enableOption = Options.boolean('enable').pipe(
  Options.withDescription('Enables CLI telemetry collection.'),
);

const disableOption = Options.boolean('disable').pipe(
  Options.withDescription('Disables CLI telemetry collection.'),
);

export const telemetryEffect = (
  arg: string | undefined,
  options: { enable: boolean; disable: boolean },
) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const telemetryService = yield* Telemetry;

    let isEnabled = yield* telemetryService.isEnabled();

    if (options.enable || arg === 'enable') {
      yield* telemetryService.setEnabled(true);
      isEnabled = true;

      yield* logger.success('Success!\n');
    } else if (options.disable || arg === 'disable') {
      yield* telemetryService.setEnabled(false);

      if (isEnabled) {
        yield* logger.success(
          'Your preference has been saved to .bigcommerce/project.json',
        );
      } else {
        yield* logger.info(
          'Catalyst CLI telemetry collection is already disabled.',
        );
      }

      isEnabled = false;
    } else {
      yield* logger.info('Catalyst CLI Telemetry\n');
    }

    yield* logger.info(
      `Status: ${colorize('bold', isEnabled ? colorize('green', 'Enabled') : colorize('red', 'Disabled'))}`,
    );

    if (!isEnabled) {
      yield* logger.info(
        'You have opted-out of Catalyst CLI telemetry. No data will be collected from your machine.',
      );
    }
  });

export const telemetryCommand = Command.make(
  'telemetry',
  { arg: telemetryArg, enable: enableOption, disable: disableOption },
  ({ arg, enable, disable }) =>
    telemetryEffect(Option.getOrUndefined(arg), { enable, disable }),
);
