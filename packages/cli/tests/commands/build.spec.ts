import { Command } from 'commander';
import { execa } from 'execa';
import { expect, test, vi } from 'vitest';

import { build } from '../../src/commands/build';
import { program } from '../../src/program';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
vi.spyOn(process, 'exit').mockImplementation(() => null as never);

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
}));

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({ stdout: '' })),
  __esModule: true,
}));

test('properly configured Command instance', () => {
  expect(build).toBeInstanceOf(Command);
  expect(build.name()).toBe('build');
  expect(build.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ long: '--framework' }),
      expect.objectContaining({ long: '--project-uuid' }),
    ]),
  );
});

test('calls execa with Next.js build if framework is nextjs', async () => {
  await program.parseAsync(['node', 'catalyst', 'build', '--framework', 'nextjs', '--debug']);

  expect(execa).toHaveBeenCalledWith(
    'node_modules/.bin/next',
    ['build', '--debug'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
