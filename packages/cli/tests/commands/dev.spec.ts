import { Command } from 'commander';
import { execa } from 'execa';
import { expect, test, vi } from 'vitest';

import { dev } from '../../src/commands/dev';
import { program } from '../../src/program';

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({ stdout: '' })),
  __esModule: true,
}));

test('properly configured Command instance', () => {
  expect(dev).toBeInstanceOf(Command);
  expect(dev.name()).toBe('dev');
  expect(dev.description()).toBe('Start the Catalyst development server');
  expect(dev.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ flags: '-p, --port <number>', defaultValue: '3000' }),
      expect.objectContaining({ flags: '--root-dir <path>', defaultValue: process.cwd() }),
    ]),
  );
});

test('calls execa with code generation', async () => {
  await program.parseAsync(['node', 'catalyst', 'dev', '--root-dir', '/path/to/root']);

  expect(execa).toHaveBeenCalledWith(
    '/path/to/root/node_modules/.bin/dotenv',
    ['-e', '.env.local', '--', 'node', './scripts/generate.cjs'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: '/path/to/root',
    }),
  );
});

test('calls execa with Next.js development server', async () => {
  await program.parseAsync(['node', 'catalyst', 'dev', '--root-dir', '/path/to/root']);

  expect(execa).toHaveBeenCalledWith(
    '/path/to/root/node_modules/.bin/next',
    ['dev', '-p', '3000'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: '/path/to/root',
    }),
  );
});
