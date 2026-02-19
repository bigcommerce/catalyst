import { Command } from 'commander';
import { execa } from 'execa';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { program } from '../program';

import { start } from './start';

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
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
  expect(start.description()).toBe(
    'Start a local preview of your Catalyst storefront using the OpenNext Cloudflare adapter.',
  );
});

test('calls execa with OpenNext production optimized server', async () => {
  await program.parseAsync(['node', 'catalyst', 'start']);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    ['exec', 'opennextjs-cloudflare', 'preview', '--config', '.bigcommerce/wrangler.jsonc'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
