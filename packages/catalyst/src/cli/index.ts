#!/usr/bin/env node
import { UserActionableError } from './lib/errors';
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

  // A user-actionable error (invalid/expired token, a clear 4xx validation or
  // conflict response, a feature that isn't enabled) already tells the user what
  // to do — print it without the "share your Correlation ID with support" noise
  // that only helps for genuine bugs and server-side failures.
  if (error instanceof UserActionableError) {
    consola.error(errorMessage);
    process.exit(1);
  }

  consola.error(errorMessage);

  if (telemetry.isEnabled()) {
    consola.info(
      `Correlation ID: ${telemetry.correlationId}\nShare this Correlation ID with BigCommerce support.`,
    );
  } else {
    consola.info(
      'Enable telemetry (`catalyst telemetry enable`) for improved troubleshooting with BigCommerce support.',
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
    await program.parseAsync(process.argv);
  } catch (error) {
    await handleFatalError(error);
  }
})();
