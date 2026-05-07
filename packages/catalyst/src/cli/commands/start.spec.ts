import { Command } from 'commander';
import { execa } from 'execa';
import { existsSync, lstatSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { getProjectState } from '../lib/project-state';
import { program } from '../program';

import { start } from './start';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  lstatSync: vi.fn(),
  symlinkSync: vi.fn(),
}));

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
}));

vi.mock('../lib/project-state', () => ({
  getProjectState: vi.fn(),
}));

const transformedState = {
  projectUuid: 'abc-123',
  hasMiddleware: true,
  hasProxy: false,
  hasOpenNextDep: true,
  isLinked: true,
  isTransformed: true,
  isFullySetUp: true,
};

const untransformedState = {
  projectUuid: undefined,
  hasMiddleware: false,
  hasProxy: true,
  hasOpenNextDep: false,
  isLinked: false,
  isTransformed: false,
  isFullySetUp: false,
};

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
  vi.mocked(getProjectState).mockReturnValue(transformedState);
});

afterEach(() => {
  vi.clearAllMocks();
});

test('properly configured Command instance', () => {
  expect(start).toBeInstanceOf(Command);
  expect(start.name()).toBe('start');
  expect(start.description()).toBe(
    'Start a local preview of your Catalyst storefront using the OpenNext Cloudflare adapter.',
  );
});

test('calls execa with OpenNext production optimized server', async () => {
  await program.parseAsync(['node', 'catalyst', 'start']);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    [
      'exec',
      'opennextjs-cloudflare',
      'preview',
      '--config',
      join('.bigcommerce', 'wrangler.jsonc'),
    ],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});

test('creates symlink when .env.local exists but .dev.vars does not', async () => {
  vi.mocked(existsSync).mockImplementation((p) => {
    if (String(p).endsWith('.env.local')) return true;

    return false;
  });

  await program.parseAsync(['node', 'catalyst', 'start']);

  expect(symlinkSync).toHaveBeenCalledWith(
    expect.stringContaining('.env.local'),
    expect.stringContaining('.dev.vars'),
  );
});

test('warns when .dev.vars exists and is not a symlink', async () => {
  vi.mocked(existsSync).mockReturnValue(true);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- partial mock
  vi.mocked(lstatSync).mockReturnValue({
    isSymbolicLink: () => false,
  } as ReturnType<typeof lstatSync>);

  await program.parseAsync(['node', 'catalyst', 'start']);

  expect(symlinkSync).not.toHaveBeenCalled();
});

test('warns when .env.local does not exist', async () => {
  vi.mocked(existsSync).mockReturnValue(false);

  await program.parseAsync(['node', 'catalyst', 'start']);

  expect(symlinkSync).not.toHaveBeenCalled();
});

test('falls through to `next start` when project is not transformed', async () => {
  vi.mocked(getProjectState).mockReturnValue(untransformedState);

  await program.parseAsync(['node', 'catalyst', 'start']);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    ['exec', 'next', 'start'],
    expect.objectContaining({ stdio: 'inherit', cwd: process.cwd() }),
  );
  expect(symlinkSync).not.toHaveBeenCalled();
});
