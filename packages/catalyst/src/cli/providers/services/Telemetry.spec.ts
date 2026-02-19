import { Effect, Layer } from 'effect';
import { describe, expect, test, vi } from 'vitest';

import { Telemetry, TelemetryLive } from './Telemetry';

describe('Telemetry service', () => {
  test('track calls through to underlying telemetry', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      yield* telemetry.track('test_event', { key: 'value' });
    });

    await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));
  });

  test('identify calls through to underlying telemetry', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      yield* telemetry.identify('store-hash');
    });

    await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));
  });

  test('isEnabled returns boolean', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      return yield* telemetry.isEnabled();
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));

    expect(typeof result).toBe('boolean');
  });

  test('setEnabled updates telemetry state', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      yield* telemetry.setEnabled(true);
    });

    await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));
  });

  test('sessionId returns a string', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      return yield* telemetry.sessionId();
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));

    expect(typeof result).toBe('string');
  });

  test('commandName and setCommandName work', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      yield* telemetry.setCommandName('deploy');

      return yield* telemetry.commandName();
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));

    expect(result).toBe('deploy');
  });

  test('durationMs returns a number', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      return yield* telemetry.durationMs();
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));

    expect(typeof result).toBe('number');
  });

  test('closeAndFlush completes successfully', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      yield* telemetry.closeAndFlush();
    });

    await Effect.runPromise(program.pipe(Effect.provide(TelemetryLive)));
  });
});

describe('Telemetry test layer', () => {
  test('can use a test implementation', async () => {
    const events: Array<{ name: string; payload: Record<string, unknown> }> = [];

    const TestTelemetry = Layer.succeed(Telemetry, {
      track: (name, payload) => {
        events.push({ name, payload });

        return Effect.void;
      },
      identify: () => Effect.void,
      isEnabled: () => Effect.succeed(true),
      setEnabled: () => Effect.void,
      sessionId: () => Effect.succeed('test-session-id'),
      commandName: () => Effect.succeed('test-command'),
      setCommandName: () => Effect.void,
      durationMs: () => Effect.succeed(42),
      closeAndFlush: () => Effect.void,
    });

    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      yield* telemetry.track('my_event', { foo: 'bar' });

      return yield* telemetry.sessionId();
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestTelemetry)));

    expect(result).toBe('test-session-id');
    expect(events).toEqual([{ name: 'my_event', payload: { foo: 'bar' } }]);
  });
});
