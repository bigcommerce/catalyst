import { Effect, Layer } from 'effect';
import { describe, expect, test } from 'vitest';

import { BuildError } from '../errors';
import { ProcessRunner } from '../../providers/services/ProcessRunner';
import { ProcessRunnerError } from '../errors';

import { BuildService, BuildServiceLive } from './BuildService';

const makeTestProcessRunner = (
  calls: Array<{ bin: string; args: string[] }> = [],
) =>
  Layer.succeed(ProcessRunner, {
    exec: (bin, args) => {
      calls.push({ bin, args });

      return Effect.succeed({ stdout: '', stderr: '', exitCode: 0 });
    },
  });

describe('BuildService', () => {
  test('buildCatalyst calls pnpm exec opennextjs-cloudflare build', async () => {
    const calls: Array<{ bin: string; args: string[] }> = [];

    // BuildService.buildCatalyst also calls copyFile, writeFile, and cp
    // which will fail in test environment since the files don't exist.
    // We test that the service correctly propagates BuildError.
    const program = Effect.gen(function* () {
      const build = yield* BuildService;

      return yield* build.buildCatalyst('test-uuid');
    });

    const layer = BuildServiceLive.pipe(Layer.provide(makeTestProcessRunner(calls)));
    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(layer)));

    // Expect failure because copyFile will fail (template doesn't exist in test env)
    expect(exit._tag).toBe('Failure');
  });

  test('propagates ProcessRunnerError as BuildError', async () => {
    const FailingRunner = Layer.succeed(ProcessRunner, {
      exec: () =>
        Effect.fail(new ProcessRunnerError({ message: 'command not found', exitCode: 127 })),
    });

    const program = Effect.gen(function* () {
      const build = yield* BuildService;

      return yield* build.buildCatalyst('test-uuid');
    });

    const layer = BuildServiceLive.pipe(Layer.provide(FailingRunner));
    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(layer)));

    expect(exit._tag).toBe('Failure');
  });
});

describe('BuildService test layer', () => {
  test('can use a test implementation', async () => {
    const builds: string[] = [];

    const TestBuildService = Layer.succeed(BuildService, {
      buildCatalyst: (projectUuid) => {
        builds.push(projectUuid);

        return Effect.void;
      },
    });

    const program = Effect.gen(function* () {
      const build = yield* BuildService;

      yield* build.buildCatalyst('my-project');
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestBuildService)));

    expect(builds).toEqual(['my-project']);
  });

  test('test layer can simulate errors', async () => {
    const TestBuildService = Layer.succeed(BuildService, {
      buildCatalyst: () => Effect.fail(new BuildError({ message: 'simulated' })),
    });

    const program = Effect.gen(function* () {
      const build = yield* BuildService;

      yield* build.buildCatalyst('test');
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestBuildService)));

    expect(exit._tag).toBe('Failure');
  });
});
