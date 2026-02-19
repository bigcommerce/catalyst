import { Effect, Layer } from 'effect';
import { describe, expect, test } from 'vitest';

import { ProcessRunnerError } from '../../core/errors';

import { ProcessRunner, ProcessRunnerLive, type ExecResult } from './ProcessRunner';

describe('ProcessRunner service', () => {
  test('executes a simple command successfully', async () => {
    const program = Effect.gen(function* () {
      const runner = yield* ProcessRunner;

      return yield* runner.exec('echo', ['hello']);
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProcessRunnerLive)));

    expect(result.stdout).toContain('hello');
    expect(result.exitCode).toBe(0);
  });

  test('returns ProcessRunnerError for failed commands', async () => {
    const program = Effect.gen(function* () {
      const runner = yield* ProcessRunner;

      return yield* runner.exec('false', []);
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(ProcessRunnerLive)));

    expect(exit._tag).toBe('Failure');
  });

  test('returns ProcessRunnerError for nonexistent commands', async () => {
    const program = Effect.gen(function* () {
      const runner = yield* ProcessRunner;

      return yield* runner.exec('nonexistent-command-xyz', []);
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(ProcessRunnerLive)));

    expect(exit._tag).toBe('Failure');
  });
});

describe('ProcessRunner test layer', () => {
  test('can use a test implementation', async () => {
    const calls: Array<{ bin: string; args: string[] }> = [];

    const TestProcessRunner = Layer.succeed(ProcessRunner, {
      exec: (bin, args) => {
        calls.push({ bin, args });

        return Effect.succeed({ stdout: 'mocked', stderr: '', exitCode: 0 });
      },
    });

    const program = Effect.gen(function* () {
      const runner = yield* ProcessRunner;

      return yield* runner.exec('pnpm', ['build']);
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestProcessRunner)));

    expect(result.stdout).toBe('mocked');
    expect(calls).toEqual([{ bin: 'pnpm', args: ['build'] }]);
  });

  test('test layer can simulate errors', async () => {
    const TestProcessRunner = Layer.succeed(ProcessRunner, {
      exec: () => Effect.fail(new ProcessRunnerError({ message: 'simulated', exitCode: 127 })),
    });

    const program = Effect.gen(function* () {
      const runner = yield* ProcessRunner;

      return yield* runner.exec('anything', []);
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestProcessRunner)));

    expect(exit._tag).toBe('Failure');
  });
});
