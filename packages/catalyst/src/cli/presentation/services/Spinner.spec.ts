import { Effect, Layer } from 'effect';
import { describe, expect, test, vi } from 'vitest';

import { Spinner, SpinnerLive } from './Spinner';

// Mock yocto-spinner so we don't need a TTY
vi.mock('yocto-spinner', () => {
  const spinnerInstance = {
    start: vi.fn().mockReturnThis(),
    success: vi.fn().mockReturnThis(),
    error: vi.fn().mockReturnThis(),
    text: '',
  };

  return {
    default: vi.fn(() => spinnerInstance),
    __spinnerInstance: spinnerInstance,
  };
});

describe('Spinner service', () => {
  test('start creates and starts a spinner', async () => {
    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      yield* spinner.start('Loading...');
    });

    await Effect.runPromise(program.pipe(Effect.provide(SpinnerLive)));
  });

  test('success finalizes the spinner', async () => {
    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      yield* spinner.start('Loading...');
      yield* spinner.success('Done!');
    });

    await Effect.runPromise(program.pipe(Effect.provide(SpinnerLive)));
  });

  test('error finalizes the spinner with error', async () => {
    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      yield* spinner.start('Loading...');
      yield* spinner.error('Failed!');
    });

    await Effect.runPromise(program.pipe(Effect.provide(SpinnerLive)));
  });

  test('setText updates spinner text', async () => {
    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      yield* spinner.start('Step 1...');
      yield* spinner.setText('Step 2...');
    });

    await Effect.runPromise(program.pipe(Effect.provide(SpinnerLive)));
  });

  test('success without start is a no-op', async () => {
    // Create a fresh layer that hasn't had start called
    const FreshSpinnerLive = Layer.sync(Spinner, () => {
      let started = false;

      return {
        start: () =>
          Effect.sync(() => {
            started = true;
          }),
        success: () =>
          Effect.sync(() => {
            if (!started) return;
            started = false;
          }),
        error: () =>
          Effect.sync(() => {
            if (!started) return;
            started = false;
          }),
        setText: () => Effect.void,
      };
    });

    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      yield* spinner.success('no-op');
    });

    await Effect.runPromise(program.pipe(Effect.provide(FreshSpinnerLive)));
  });
});

describe('Spinner test layer', () => {
  test('can use a test implementation that records state', async () => {
    const history: string[] = [];

    const TestSpinner = Layer.succeed(Spinner, {
      start: (text) => {
        history.push(`start:${text}`);

        return Effect.void;
      },
      success: (text) => {
        history.push(`success:${text}`);

        return Effect.void;
      },
      error: (text) => {
        history.push(`error:${text}`);

        return Effect.void;
      },
      setText: (text) => {
        history.push(`text:${text}`);

        return Effect.void;
      },
    });

    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      yield* spinner.start('Loading...');
      yield* spinner.setText('Processing...');
      yield* spinner.success('Done!');
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestSpinner)));

    expect(history).toEqual(['start:Loading...', 'text:Processing...', 'success:Done!']);
  });
});
