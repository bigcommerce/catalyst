import { Command } from 'commander';
import { execa } from 'execa';
import { expect, test, vi } from 'vitest';

import { start } from '../../src/commands/start';
import { program } from '../../src/program';

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
}));

test('properly configured Command instance', () => {
  expect(start).toBeInstanceOf(Command);
  expect(start.name()).toBe('start');
  expect(start.description()).toBe('Start your Catalyst storefront in optimized production mode.');
  expect(start.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ flags: '-p, --port <number>', defaultValue: '3000' }),
      expect.objectContaining({ flags: '--root-dir <path>', defaultValue: process.cwd() }),
    ]),
  );
});

test('calls execa with Next.js production optimized server', async () => {
  await program.parseAsync([
    'node',
    'catalyst',
    'start',
    '-p',
    '3001',
    '--root-dir',
    '/path/to/root',
  ]);

  expect(execa).toHaveBeenCalledWith(
    '/path/to/root/node_modules/.bin/next',
    ['start', '-p', '3001'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: '/path/to/root',
    }),
  );
});
