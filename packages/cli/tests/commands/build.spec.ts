import { access, mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { createFilter, mkTempDir } from '../../src/commands/build';

describe('mkTempDir', () => {
  test('creates directory that actually exists', async () => {
    const [path, cleanup] = await mkTempDir();

    const stats = await stat(path);

    expect(stats.isDirectory()).toBe(true);

    await cleanup();
  });

  test('cleanup function removes the directory', async () => {
    const [path, cleanup] = await mkTempDir();

    await expect(access(path)).resolves.not.toThrow();

    await cleanup();

    await expect(access(path)).rejects.toThrow();
  });

  test('cleanup removes directory recursively with contents', async () => {
    const [path, cleanup] = await mkTempDir();

    await mkdir(join(path, 'subdir'));
    await writeFile(join(path, 'file.txt'), 'test content');
    await writeFile(join(path, 'subdir', 'nested.txt'), 'nested content');

    await cleanup();

    await expect(access(path)).rejects.toThrow();
  });

  test('cleanup is idempotent', async () => {
    const [, cleanup] = await mkTempDir();

    await cleanup();
    await expect(cleanup()).resolves.not.toThrow();
  });
});

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
