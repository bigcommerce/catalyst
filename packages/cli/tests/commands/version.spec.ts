import { Command } from '@commander-js/extra-typings';
import { afterEach, beforeEach, expect, MockInstance, test, vi } from 'vitest';

import { version } from '../../src/commands/version';

vi.mock('chalk', () => ({
  default: new Proxy(
    {},
    {
      get: () => (str: string) => str,
    },
  ),
}));

let consoleMock: MockInstance;

beforeEach(() => {
  consoleMock = vi.spyOn(console, 'log').mockImplementation(() => null);
});

afterEach(() => {
  consoleMock.mockReset();
});

test('properly configured Command instance', () => {
  expect(version).toBeInstanceOf(Command);
  expect(version.name()).toBe('version');
  expect(version.description()).toBe('Display detailed version information');
});

test('displays version information when executed', async () => {
  await version.parseAsync([]);

  expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining('Version Information:'));

  expect(consoleMock).toHaveBeenCalledWith(
    expect.stringContaining(`CLI Version: ${process.env.npm_package_version}`),
  );

  expect(consoleMock).toHaveBeenCalledWith(
    expect.stringContaining(`Node Version: ${process.version}`),
  );

  expect(consoleMock).toHaveBeenCalledWith(
    expect.stringContaining(`Platform: ${process.platform} (${process.arch})`),
  );
});
