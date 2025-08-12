import consola, { LogLevels } from 'consola';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { buildNextjs, createLogger } from '../../../src/commands/build/action';

describe('action', () => {
  beforeAll(() => {
    consola.wrapAll();
  });

  beforeEach(() => {
    consola.mockTypes(() => vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createLogger', () => {
    test('creates a logger with verbose log level', () => {
      const logger = createLogger({ verbose: true });

      expect(logger.level).toBe(LogLevels.verbose);
    });

    test('creates a logger with info log level', () => {
      const logger = createLogger({ verbose: false });

      expect(logger.level).toBe(LogLevels.info);
    });
  });

  describe('buildNextjs', () => {
    test('invokes next to build the project', async () => {
      const exec = vi.fn();

      await buildNextjs(exec, () => '/path/to/catalyst/core/node_modules/.bin/next');

      expect(exec).toHaveBeenCalledWith('/path/to/catalyst/core/node_modules/.bin/next', ['build']);
    });
  });
});
