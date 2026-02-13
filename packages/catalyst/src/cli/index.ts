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
      commandName: 'unknown',
      errorMessage,
      errorStack,
      durationMs: telemetry.durationMs(),
    });
    await telemetry.analytics.closeAndFlush();
  } catch {
    // Don't mask the original error
  }

  consola.error(errorMessage);

  const traceMessage = telemetry.isEnabled()
    ? 'Share this Trace ID with BigCommerce support.'
    : 'Enable telemetry (`catalyst telemetry enable`) so this Trace ID can be looked up by support.';

  consola.info(`\nTrace ID: ${telemetry.sessionId}\n${traceMessage}`);

  process.exit(1);
};

process.on('uncaughtException', (error) => {
  void handleFatalError(error);
});

process.on('unhandledRejection', (reason) => {
  void handleFatalError(reason);
});

program.parse(process.argv);
