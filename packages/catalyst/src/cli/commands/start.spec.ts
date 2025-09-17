import { Command } from 'commander';
import { execa } from 'execa';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { program } from '../program';

import { start } from './start';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
}));

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
}));

vi.mock('../../src/lib/project-config', () => ({
  getProjectConfig: vi.fn(() => ({
    get: vi.fn((key) => {
      if (key === 'framework') {
        return 'catalyst';
      }

      return undefined;
    }),
  })),
}));

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

test('properly configured Command instance', () => {
  expect(start).toBeInstanceOf(Command);
  expect(start.name()).toBe('start');
  expect(start.description()).toBe('Start your Catalyst storefront in optimized production mode.');
  expect(start.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        flags: '--framework <framework>',
        argChoices: ['catalyst', 'nextjs'],
      }),
    ]),
  );
});

test('calls execa with Next.js production optimized server', async () => {
  await program.parseAsync([
    'node',
    'catalyst',
    'start',
    '--port',
    '3001',
    '--framework',
    'nextjs',
  ]);

  expect(execa).toHaveBeenCalledWith(
    'node_modules/.bin/next',
    ['start', '--port', '3001'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});

test('calls execa with OpenNext production optimized server', async () => {
  await program.parseAsync([
    'node',
    'catalyst',
    'start',
    '--port',
    '3001',
    '--framework',
    'catalyst',
  ]);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    [
      'exec',
      'opennextjs-cloudflare',
      'preview',
      '--config',
      '.bigcommerce/wrangler.jsonc',
      '--port',
      '3001',
    ],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
