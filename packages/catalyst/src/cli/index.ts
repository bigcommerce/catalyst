#!/usr/bin/env node
import { consola } from './lib/logger';
import { getTelemetry } from './lib/telemetry';
import { program } from './program';

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

try {
  await program.parseAsync(process.argv);
} catch (error) {
  await handleFatalError(error);
}
