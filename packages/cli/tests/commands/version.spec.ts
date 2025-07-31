import { Command } from '@commander-js/extra-typings';
import consola from 'consola';
import { beforeAll, expect, test, vi } from 'vitest';

import { version } from '../../src/commands/version';
import { program } from '../../src/program';

vi.mock('chalk', () => ({
  default: new Proxy(
    {},
    {
      get: () => (str: string) => str,
    },
  ),
}));

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

test('properly configured Command instance', () => {
  expect(version).toBeInstanceOf(Command);
  expect(version.name()).toBe('version');
  expect(version.description()).toBe('Display detailed version information.');
});

test('displays version information when executed', async () => {
  await program.parseAsync(['node', 'catalyst', 'version']);

  expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('Version Information:'));

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(`CLI Version: ${process.env.npm_package_version}`),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(`Node Version: ${process.version}`),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(`Platform: ${process.platform} (${process.arch})`),
  );
});
