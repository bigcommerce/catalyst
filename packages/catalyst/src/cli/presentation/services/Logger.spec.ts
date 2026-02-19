import { Effect, Layer } from 'effect';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { consola } from '../../lib/logger';

import { Logger, LoggerLive } from './Logger';

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

describe('Logger service', () => {
  test('log calls consola.log', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.log('test message');
    });

    await Effect.runPromise(program.pipe(Effect.provide(LoggerLive)));

    expect(consola.log).toHaveBeenCalledWith('test message');
  });

  test('info calls consola.info', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.info('info message');
    });

    await Effect.runPromise(program.pipe(Effect.provide(LoggerLive)));

    expect(consola.info).toHaveBeenCalledWith('info message');
  });

  test('success calls consola.success', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.success('success message');
    });

    await Effect.runPromise(program.pipe(Effect.provide(LoggerLive)));

    expect(consola.success).toHaveBeenCalledWith('success message');
  });

  test('error calls consola.error', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.error('error message');
    });

    await Effect.runPromise(program.pipe(Effect.provide(LoggerLive)));

    expect(consola.error).toHaveBeenCalledWith('error message');
  });

  test('warn calls consola.warn', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.warn('warn message');
    });

    await Effect.runPromise(program.pipe(Effect.provide(LoggerLive)));

    expect(consola.warn).toHaveBeenCalledWith('warn message');
  });

  test('start calls consola.start', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.start('starting...');
    });

    await Effect.runPromise(program.pipe(Effect.provide(LoggerLive)));

    expect(consola.start).toHaveBeenCalledWith('starting...');
  });
});

describe('Logger test layer', () => {
  test('can use a test implementation that records messages', async () => {
    const messages: Array<{ level: string; message: string }> = [];

    const TestLogger = Layer.succeed(Logger, {
      log: (message) => {
        messages.push({ level: 'log', message });

        return Effect.void;
      },
      info: (message) => {
        messages.push({ level: 'info', message });

        return Effect.void;
      },
      success: (message) => {
        messages.push({ level: 'success', message });

        return Effect.void;
      },
      error: (message) => {
        messages.push({ level: 'error', message });

        return Effect.void;
      },
      warn: (message) => {
        messages.push({ level: 'warn', message });

        return Effect.void;
      },
      start: (message) => {
        messages.push({ level: 'start', message });

        return Effect.void;
      },
      prompt: () => Effect.succeed('mocked response'),
    });

    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      yield* logger.info('hello');
      yield* logger.success('done');
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestLogger)));

    expect(messages).toEqual([
      { level: 'info', message: 'hello' },
      { level: 'success', message: 'done' },
    ]);
  });
});
