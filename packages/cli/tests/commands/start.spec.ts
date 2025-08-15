import { Command } from 'commander';
import { execa } from 'execa';
import { expect, test, vi } from 'vitest';

import { start } from '../../src/commands/start';
import { program } from '../../src/program';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
}));

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
}));

test('properly configured Command instance', () => {
  expect(start).toBeInstanceOf(Command);
  expect(start.name()).toBe('start');
  expect(start.description()).toBe('Start your Catalyst storefront in optimized production mode.');
});

test('calls execa with Next.js production optimized server', async () => {
  await program.parseAsync(['node', 'catalyst', 'start', '-p', '3001']);

  expect(execa).toHaveBeenCalledWith(
    'node_modules/.bin/next',
    ['start', '-p', '3001'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
