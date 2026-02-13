import { consola } from './logger';
import { getTelemetry } from './telemetry';

export function withErrorHandler<T extends unknown[]>(
  commandName: string,
  action: (...args: T) => Promise<void>,
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await action(...args);
    } catch (error) {
      const telemetry = getTelemetry();

      try {
        await telemetry.trackError(commandName, error);
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
    }
  };
}
