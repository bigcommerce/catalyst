import { Command } from '@effect/cli';
import { Effect } from 'effect';

import PACKAGE_INFO from '../../../package.json';
import { Logger } from '../presentation/services/Logger';

export const versionEffect = Effect.gen(function* () {
  const logger = yield* Logger;

  yield* logger.log('Version Information:');
  yield* logger.log(`CLI Version: ${PACKAGE_INFO.version}`);
  yield* logger.log(`Node Version: ${process.version}`);
  yield* logger.log(`Platform: ${process.platform} (${process.arch})`);
});

export const versionCommand = Command.make('version', {}, () =>
  versionEffect,
).pipe(Command.withDescription('Display detailed version information.'));
