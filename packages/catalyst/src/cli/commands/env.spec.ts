import { Command } from 'commander';
import { afterAll, afterEach, beforeAll, beforeEach, expect, MockInstance, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig } from '../lib/project-config';
import { program } from '../program';

import { env } from './env';

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();
});

beforeEach(() => {
  process.chdir(tmpDir);
});

afterEach(() => {
  getProjectConfig().delete('env');
  vi.clearAllMocks();
});

afterAll(async () => {
  await cleanup();
});

test('properly configured Command instance', () => {
  expect(env).toBeInstanceOf(Command);
  expect(env.name()).toBe('env');
  expect(env.commands.map((c) => c.name()).sort()).toEqual(['add', 'list', 'remove']);
});

test('add stores variables in .bigcommerce/project.json', async () => {
  await program.parseAsync(['node', 'catalyst', 'env', 'add', 'FOO=bar', 'BAZ=qux']);

  expect(getProjectConfig().get('env')).toEqual({ FOO: 'bar', BAZ: 'qux' });
  expect(exitMock).toHaveBeenCalledWith(0);
});

test('add merges with and overwrites existing variables', async () => {
  const config = getProjectConfig();

  config.set('env', { FOO: 'old', KEEP: 'me' });

  await program.parseAsync(['node', 'catalyst', 'env', 'add', 'FOO=new']);

  expect(config.get('env')).toEqual({ FOO: 'new', KEEP: 'me' });
});

test('add never prints the raw value', async () => {
  await program.parseAsync(['node', 'catalyst', 'env', 'add', 'SECRET=supersecret']);

  const logged = vi.mocked(consola.log).mock.calls.flat().join('\n');

  expect(logged).toContain('SECRET=');
  expect(logged).not.toContain('supersecret');
});

test('add rejects an invalid assignment without partially writing', async () => {
  const config = getProjectConfig();

  config.set('env', { EXISTING: 'value' });

  await expect(
    program.parseAsync(['node', 'catalyst', 'env', 'add', 'GOOD=ok', 'bad-entry']),
  ).rejects.toThrow('Invalid env var format: bad-entry');

  // GOOD must not have been persisted since one entry was invalid.
  expect(config.get('env')).toEqual({ EXISTING: 'value' });
});

test('remove deletes stored variables', async () => {
  const config = getProjectConfig();

  config.set('env', { FOO: 'bar', BAZ: 'qux' });

  await program.parseAsync(['node', 'catalyst', 'env', 'remove', 'FOO']);

  expect(config.get('env')).toEqual({ BAZ: 'qux' });
  expect(exitMock).toHaveBeenCalledWith(0);
});

test('remove warns for keys that are not stored', async () => {
  getProjectConfig().set('env', { FOO: 'bar' });

  await program.parseAsync(['node', 'catalyst', 'env', 'remove', 'MISSING']);

  expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('MISSING'));
});

test('list shows stored keys with masked values', async () => {
  getProjectConfig().set('env', { FOO: 'bar' });

  await program.parseAsync(['node', 'catalyst', 'env', 'list']);

  const logged = vi.mocked(consola.log).mock.calls.flat().join('\n');

  expect(logged).toContain('FOO=');
  expect(logged).not.toContain('bar');
});

test('list reports when nothing is stored', async () => {
  await program.parseAsync(['node', 'catalyst', 'env', 'list']);

  expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('No environment variables'));
});
