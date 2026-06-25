import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { computeBaseSimilarity, parseRef } from './upgrade';

const createdDirs: string[] = [];

async function mkTmp(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'upgrade-spec-'));

  createdDirs.push(dir);

  return dir;
}

async function write(file: string, content: string | Buffer): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('parseRef', () => {
  test('splits a scoped package ref on the last @', () => {
    expect(parseRef('@bigcommerce/catalyst-core@1.7.0')).toEqual({
      packageName: '@bigcommerce/catalyst-core',
      version: '1.7.0',
    });
  });

  test('handles integration families', () => {
    expect(parseRef('@bigcommerce/catalyst-makeswift@1.7.0')).toEqual({
      packageName: '@bigcommerce/catalyst-makeswift',
      version: '1.7.0',
    });
  });

  test('throws when there is no version separator', () => {
    expect(() => parseRef('catalyst-core')).toThrow();
  });
});

describe('computeBaseSimilarity', () => {
  test('returns 1.0 when all base files match exactly', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'a.txt'), 'hello\n'),
      write(join(root, 'base', 'b.txt'), 'world\n'),
      write(join(root, 'dest', 'a.txt'), 'hello\n'),
      write(join(root, 'dest', 'b.txt'), 'world\n'),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(1.0);
  });

  test('returns 0.5 when half the base files match', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'match.txt'), 'same\n'),
      write(join(root, 'base', 'differ.txt'), 'original\n'),
      write(join(root, 'dest', 'match.txt'), 'same\n'),
      write(join(root, 'dest', 'differ.txt'), 'modified\n'),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(0.5);
  });

  test('returns 0 when no base files exist in dest', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'a.txt'), 'content\n'),
      mkdir(join(root, 'dest'), { recursive: true }),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(0);
  });

  test('returns 0 for an empty base', async () => {
    const root = await mkTmp();

    await Promise.all([
      mkdir(join(root, 'base'), { recursive: true }),
      mkdir(join(root, 'dest'), { recursive: true }),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(0);
  });

  test('extra files in dest do not affect the score (only base coverage counts)', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'a.txt'), 'content\n'),
      write(join(root, 'dest', 'a.txt'), 'content\n'),
      write(join(root, 'dest', 'extra.txt'), 'merchant addition\n'),
    ]);

    // 1 base file, 1 match → 1.0 regardless of extra dest files
    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(1.0);
  });
});
