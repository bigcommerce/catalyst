#!/usr/bin/env node
import { NodeContext } from '@effect/platform-node';
import { colorize } from 'consola/utils';
import { Effect, Layer } from 'effect';

import PACKAGE_INFO from '../../package.json';

import { cli } from './commands/root';
import { LiveLayer } from './layers';
import { loadEnvFile } from './lib/load-env-file';
import { consola } from './lib/logger';
import { getTelemetry } from './lib/telemetry';

consola.log(colorize('cyanBright', `◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

const processedArgv = loadEnvFile(process.argv);

const AppLayer = Layer.mergeAll(LiveLayer, NodeContext.layer);

const handleFatalError = async (error: unknown) => {
  const telemetry = getTelemetry();

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  try {
    await telemetry.track('error', {
      commandName: telemetry.commandName,
      errorMessage,
      errorStack,
      durationMs: telemetry.durationMs(),
    });
    await telemetry.analytics.closeAndFlush();
  } catch {
    // Don't mask the original error
  }

  consola.error(errorMessage);

  if (telemetry.isEnabled()) {
    consola.info(
      `\nTrace ID: ${telemetry.sessionId}\nShare this Trace ID with BigCommerce support.`,
    );
  } else {
    consola.info(
      '\nEnable telemetry (`catalyst telemetry enable`) for improved troubleshooting with BigCommerce support.',
    );
  }

  process.exit(1);
};

process.on('uncaughtException', (error) => {
  void handleFatalError(error);
});

process.on('unhandledRejection', (reason) => {
  void handleFatalError(reason);
});

void (async () => {
  try {
    await Effect.runPromise(
      Effect.suspend(() => cli(processedArgv)).pipe(
        Effect.provide(AppLayer),
      ),
    );
  } catch (error) {
    await handleFatalError(error);
  }
})();
