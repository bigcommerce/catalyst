import { Command } from 'commander';
import consola from 'consola';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { build, createFilter } from '../../src/commands/build';
import { program } from '../../src/program';

const cleanup = vi.fn();

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  consola.wrapAll();

  vi.mock('../../src/lib/mk-temp-dir', () => ({
    mkTempDir: vi.fn(() => ['/tmp/test', cleanup]),
  }));

  vi.mock('node:fs/promises', () => ({
    cp: vi.fn(),
  }));

  vi.mock('nypm', () => ({
    installDependencies: vi.fn(),
    addDevDependency: vi.fn(),
    runScript: vi.fn(),
  }));

  vi.mock('execa', () => ({
    execa: vi.fn(),
  }));
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

test('properly configured Command instance', () => {
  expect(build).toBeInstanceOf(Command);
  expect(build.name()).toBe('build');
  expect(build.options).toEqual(
    expect.arrayContaining([expect.objectContaining({ flags: '--keep-temp-dir' })]),
  );
});

test('does not remove temp dir if --keep-temp-dir is passed', async () => {
  await program.parseAsync(['node', 'catalyst', 'build', '--keep-temp-dir']);
  expect(cleanup).not.toHaveBeenCalled();
});

test('removes temp dir if --keep-temp-dir is not passed', async () => {
  await program.parseAsync(['node', 'catalyst', 'build']);
  expect(cleanup).toHaveBeenCalled();
});

test('successfully builds project', async () => {
  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(consola.success).toHaveBeenCalledWith('Project built');
  expect(consola.success).toHaveBeenCalledWith('Build copied to project');
});

test('handles error if cp throws during build', async () => {
  // Dynamically mock cp for this test only
  // eslint-disable-next-line import/dynamic-import-chunkname
  const cpModule = await import('node:fs/promises');
  const originalCp = cpModule.cp;
  const cpMock = vi.fn(() => {
    throw new Error('cp failed');
  });

  cpModule.cp = cpMock;

  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(consola.error).toHaveBeenCalledWith(expect.any(Error));

  cpModule.cp = originalCp;
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
