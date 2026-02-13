#!/usr/bin/env node
import { consola } from './lib/logger';
import { getTelemetry } from './lib/telemetry';
import { program } from './program';

const handleFatalError = async (error: unknown) => {
  const telemetry = getTelemetry();

  try {
    await telemetry.trackError('unknown', error);
    await telemetry.analytics.closeAndFlush();
  } catch {
    // Don't mask the original error
  }

  consola.error(error instanceof Error ? error.message : String(error));

  const traceMessage = telemetry.isEnabled()
    ? 'Share this Trace ID with BigCommerce support.'
    : 'Enable telemetry (`catalyst telemetry enable`) so this Trace ID can be looked up by support.';

  consola.info(`\nTrace ID: ${telemetry.traceId()}\n${traceMessage}`);

  process.exit(1);
};

process.on('uncaughtException', (error) => {
  void handleFatalError(error);
});

process.on('unhandledRejection', (reason) => {
  void handleFatalError(reason);
});

program.parse(process.argv);
