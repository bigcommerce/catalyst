import { Effect, Layer } from 'effect';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { mkTempDir } from '../../lib/mk-temp-dir';
import { consola } from '../../lib/logger';

import { ProjectConfig, ProjectConfigLive } from './ProjectConfig';

let tmpDir: string;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  [tmpDir, cleanup] = await mkTempDir();
});

afterAll(async () => {
  await cleanup();
});

// Mock getProjectConfig to use our temp dir
vi.mock('../../lib/project-config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/project-config')>();

  return {
    ...actual,
    getProjectConfig: () => actual.getProjectConfig(),
  };
});

describe('ProjectConfig service', () => {
  test('can set and get a value', async () => {
    const program = Effect.gen(function* () {
      const config = yield* ProjectConfig;

      yield* config.set('storeHash', 'test-hash');

      const value = yield* config.get('storeHash');

      return value;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProjectConfigLive)));

    expect(result).toBe('test-hash');
  });

  test('can delete a value', async () => {
    const program = Effect.gen(function* () {
      const config = yield* ProjectConfig;

      yield* config.set('storeHash', 'to-delete');
      yield* config.delete('storeHash');

      return yield* config.get('storeHash');
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProjectConfigLive)));

    expect(result).toBeUndefined();
  });

  test('getConfig returns underlying Conf instance', () => {
    const program = Effect.gen(function* () {
      const config = yield* ProjectConfig;
      const conf = config.getConfig();

      return conf !== null && conf !== undefined;
    });

    const result = Effect.runSync(program.pipe(Effect.provide(ProjectConfigLive)));

    expect(result).toBe(true);
  });
});

describe('ProjectConfig test layer', () => {
  test('can use a test implementation', async () => {
    const store = new Map<string, unknown>();

    const TestProjectConfig = Layer.succeed(ProjectConfig, {
      get: (key) => Effect.sync(() => store.get(key) as never),
      set: (key, value) =>
        Effect.sync(() => {
          store.set(key, value);
        }),
      delete: (key) =>
        Effect.sync(() => {
          store.delete(key);
        }),
      getConfig: () => {
        throw new Error('Not available in test');
      },
    });

    const program = Effect.gen(function* () {
      const config = yield* ProjectConfig;

      yield* config.set('storeHash', 'test-value');

      return yield* config.get('storeHash');
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestProjectConfig)));

    expect(result).toBe('test-value');
  });
});
