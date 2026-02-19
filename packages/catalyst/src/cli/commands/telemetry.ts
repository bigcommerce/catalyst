import { Argument, Command, Option } from 'commander';
import { colorize } from 'consola/utils';
import { Effect, Layer } from 'effect';

import { Logger } from '../presentation/services/Logger';
import { Telemetry } from '../providers/services/Telemetry';
import { PresentationLive } from '../presentation/layers';
import { TelemetryLive } from '../providers/services/Telemetry';

const TelemetryCommandLayer = Layer.merge(PresentationLive, TelemetryLive);

export const telemetryEffect = (
  arg: string | undefined,
  options: { enable?: boolean; disable?: boolean },
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

export const telemetry = new Command('telemetry')
  .addArgument(new Argument('[arg]').choices(['disable', 'enable', 'status']))
  .addOption(
    new Option('--enable', 'Enables CLI telemetry collection.').conflicts(
      'disable',
    ),
  )
  .option('--disable', 'Disables CLI telemetry collection.')
  .action((arg, options) =>
    Effect.runPromise(
      telemetryEffect(arg, options).pipe(Effect.provide(TelemetryCommandLayer)),
    ),
  );
