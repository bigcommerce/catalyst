import { access, mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';

import { mkTempDir } from '../../src/lib/mk-temp-dir';

test('creates directory that actually exists', async () => {
  const [path, cleanup] = await mkTempDir('catalyst-build-');

  const stats = await stat(path);

  expect(stats.isDirectory()).toBe(true);

  await cleanup();
});

test('cleanup function removes the directory', async () => {
  const [path, cleanup] = await mkTempDir('catalyst-build-');

  await expect(access(path)).resolves.not.toThrow();

  await cleanup();

  await expect(access(path)).rejects.toThrow();
});

test('cleanup removes directory recursively with contents', async () => {
  const [path, cleanup] = await mkTempDir('catalyst-build-');

  await mkdir(join(path, 'subdir'));
  await writeFile(join(path, 'file.txt'), 'test content');
  await writeFile(join(path, 'subdir', 'nested.txt'), 'nested content');

  await cleanup();

  await expect(access(path)).rejects.toThrow();
});

test('cleanup is idempotent', async () => {
  const [, cleanup] = await mkTempDir('catalyst-build-');

  await cleanup();
  await expect(cleanup()).resolves.not.toThrow();
});
