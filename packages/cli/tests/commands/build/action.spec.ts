import consola, { LogLevels } from 'consola';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  buildNextjs,
  createLogger,
  generateGqlTadaTypes,
  resolveFramework,
} from '../../../src/commands/build/action';

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

  describe('resolveFramework', () => {
    test('uses framework from options if provided', () => {
      const framework = resolveFramework(
        { framework: 'nextjs', verbose: false },
        () => ({
          get: () => 'catalyst',
          path: '',
        }),
        consola,
      );

      expect(framework).toBe('nextjs');
    });

    test('uses framework from config if not provided in options', () => {
      const framework = resolveFramework(
        { verbose: false },
        () => ({
          get: () => 'catalyst',
          path: '',
        }),
        consola,
      );

      expect(framework).toBe('catalyst');
    });
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

  describe('generateGqlTadaTypes', () => {
    test('invokes dotenv to generate gql.tada types', async () => {
      const exec = vi.fn();

      await generateGqlTadaTypes(exec, () => '/path/to/catalyst/core/node_modules/.bin/dotenv');

      expect(exec).toHaveBeenCalledWith('/path/to/catalyst/core/node_modules/.bin/dotenv', [
        '-e',
        '.env.local',
        '--',
        'node',
        './scripts/generate.cjs',
      ]);
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
