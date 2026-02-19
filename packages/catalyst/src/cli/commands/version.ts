import { Command } from 'commander';
import { Effect } from 'effect';

import PACKAGE_INFO from '../../../package.json';
import { Logger } from '../presentation/services/Logger';
import { PresentationLive } from '../presentation/layers';

export const versionEffect = Effect.gen(function* () {
  const logger = yield* Logger;

  yield* logger.log('Version Information:');
  yield* logger.log(`CLI Version: ${PACKAGE_INFO.version}`);
  yield* logger.log(`Node Version: ${process.version}`);
  yield* logger.log(`Platform: ${process.platform} (${process.arch})`);
});

export const version = new Command('version')
  .description('Display detailed version information.')
  .action(() => Effect.runPromise(versionEffect.pipe(Effect.provide(PresentationLive))));
