import { Command } from 'commander';
import { execa } from 'execa';
import { expect, test, vi } from 'vitest';

import { dev } from '../../src/commands/dev';
import { program } from '../../src/program';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
}));

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({ stdout: '' })),
  __esModule: true,
}));

test('properly configured Command instance', () => {
  expect(dev).toBeInstanceOf(Command);
  expect(dev.name()).toBe('dev');
  expect(dev.description()).toBe('Start the Catalyst development server.');
});

test('calls execa with Next.js development server', async () => {
  await program.parseAsync(['node', 'catalyst', 'dev', '-p', '3001']);

  expect(execa).toHaveBeenCalledWith(
    'node_modules/.bin/next',
    ['dev', '-p', '3001'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
