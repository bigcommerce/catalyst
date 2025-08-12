import consola from 'consola';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { resolveFramework } from '../../src/lib/resolve-framework';

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

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
