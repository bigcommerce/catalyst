import { Command } from 'commander';
import { execa } from 'execa';
import { join } from 'node:path';
import { expect, test, vi } from 'vitest';

import { program } from '../program';

import { dev } from './dev';

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

  const expectedNextBin = join('node_modules', '.bin', 'next');

  expect(execa).toHaveBeenCalledWith(
    expectedNextBin,
    ['dev', '-p', '3001'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
