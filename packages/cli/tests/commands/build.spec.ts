import { describe, expect, test } from 'vitest';

import { createFilter } from '../../src/commands/build';

describe('createFilter', () => {
  const ROOT = '/my/project';
  const SKIP_DIRS = new Set(['node_modules', '.git', 'dist']);

  const filter = createFilter(ROOT, SKIP_DIRS);

  test('allows files not in skip list', () => {
    expect(filter('/my/project/src/index.ts')).toBe(true);
  });

  test('skips files inside a skipped directory', () => {
    expect(filter('/my/project/node_modules/lodash/index.js')).toBe(false);
    expect(filter('/my/project/.git/config')).toBe(false);
    expect(filter('/my/project/dist/main.js')).toBe(false);
  });

  test('handles nested skipped folders', () => {
    expect(filter('/my/project/src/node_modules/whatever.js')).toBe(false);
  });
});
