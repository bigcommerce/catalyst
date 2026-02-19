import { Effect } from 'effect';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';

import { PresentationLive } from './layers';
import { Logger } from './services/Logger';
import { Spinner } from './services/Spinner';

vi.mock('yocto-spinner', () => {
  const spinnerInstance = {
    start: vi.fn().mockReturnThis(),
    success: vi.fn().mockReturnThis(),
    error: vi.fn().mockReturnThis(),
    text: '',
  };

  return {
    default: vi.fn(() => spinnerInstance),
  };
});

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

describe('PresentationLive layer', () => {
  test('provides Logger', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;

      return logger !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(PresentationLive)));

    expect(result).toBe(true);
  });

  test('provides Spinner', async () => {
    const program = Effect.gen(function* () {
      const spinner = yield* Spinner;

      return spinner !== null;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(PresentationLive)));

    expect(result).toBe(true);
  });
});
