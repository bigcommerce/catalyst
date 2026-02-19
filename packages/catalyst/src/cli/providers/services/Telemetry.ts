import { Context, Effect, Layer } from 'effect';

import { getTelemetry } from '../../lib/telemetry';

export class Telemetry extends Context.Tag('@catalyst/Telemetry')<
  Telemetry,
  {
    readonly track: (
      eventName: string,
      payload: Record<string, unknown>,
    ) => Effect.Effect<void>;
    readonly identify: (storeHash?: string) => Effect.Effect<void>;
    readonly isEnabled: () => Effect.Effect<boolean>;
    readonly setEnabled: (enabled: boolean) => Effect.Effect<void>;
    readonly sessionId: () => Effect.Effect<string>;
    readonly commandName: () => Effect.Effect<string>;
    readonly setCommandName: (name: string) => Effect.Effect<void>;
    readonly durationMs: () => Effect.Effect<number>;
    readonly closeAndFlush: () => Effect.Effect<void>;
  }
>() {}

export const TelemetryLive = Layer.sync(Telemetry, () => {
  const telemetry = getTelemetry();

  return {
    track: (eventName, payload) =>
      Effect.promise(() => telemetry.track(eventName, payload).then(() => undefined)),
    identify: (storeHash) =>
      Effect.promise(() => telemetry.identify(storeHash).then(() => undefined)),
    isEnabled: () => Effect.sync(() => telemetry.isEnabled()),
    setEnabled: (enabled) => Effect.sync(() => telemetry.setEnabled(enabled)),
    sessionId: () => Effect.sync(() => telemetry.sessionId),
    commandName: () => Effect.sync(() => telemetry.commandName),
    setCommandName: (name) =>
      Effect.sync(() => {
        telemetry.commandName = name;
      }),
    durationMs: () => Effect.sync(() => telemetry.durationMs()),
    closeAndFlush: () => Effect.promise(() => telemetry.analytics.closeAndFlush()),
  };
});
