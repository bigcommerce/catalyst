import { Effect } from 'effect';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';

import { ProvidersLive } from './layers';
import { BrowserOpen } from './services/BrowserOpen';
import { ProcessRunner } from './services/ProcessRunner';
import { ProjectConfig } from './services/ProjectConfig';
import { Telemetry } from './services/Telemetry';
import { ZipArchive } from './services/ZipArchive';

vi.mock('open', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

describe('ProvidersLive layer', () => {
  test('provides ProjectConfig', async () => {
    const program = Effect.gen(function* () {
      const config = yield* ProjectConfig;

      return config !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProvidersLive)));

    expect(result).toBe(true);
  });

  test('provides ProcessRunner', async () => {
    const program = Effect.gen(function* () {
      const runner = yield* ProcessRunner;

      return runner !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProvidersLive)));

    expect(result).toBe(true);
  });

  test('provides ZipArchive', async () => {
    const program = Effect.gen(function* () {
      const zip = yield* ZipArchive;

      return zip !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProvidersLive)));

    expect(result).toBe(true);
  });

  test('provides BrowserOpen', async () => {
    const program = Effect.gen(function* () {
      const browser = yield* BrowserOpen;

      return browser !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProvidersLive)));

    expect(result).toBe(true);
  });

  test('provides Telemetry', async () => {
    const program = Effect.gen(function* () {
      const telemetry = yield* Telemetry;

      return telemetry !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(ProvidersLive)));

    expect(result).toBe(true);
  });
});
