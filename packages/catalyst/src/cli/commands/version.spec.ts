import { Command } from '@commander-js/extra-typings';
import { Effect, Layer } from 'effect';
import { beforeAll, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { Logger } from '../presentation/services/Logger';
import { program } from '../program';

import { version, versionEffect } from './version';

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

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining('Version Information:'),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(`CLI Version: ${process.env.npm_package_version}`),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(`Node Version: ${process.version}`),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(
      `Platform: ${process.platform} (${process.arch})`,
    ),
  );
});

test('versionEffect works with test Logger', async () => {
  const messages: string[] = [];

  const TestLogger = Layer.succeed(Logger, {
    log: (message) => {
      messages.push(message);

      return Effect.void;
    },
    info: () => Effect.void,
    success: () => Effect.void,
    error: () => Effect.void,
    warn: () => Effect.void,
    start: () => Effect.void,
    prompt: () => Effect.succeed(''),
  });

  await Effect.runPromise(versionEffect.pipe(Effect.provide(TestLogger)));

  expect(messages).toEqual([
    'Version Information:',
    expect.stringContaining('CLI Version:'),
    expect.stringContaining('Node Version:'),
    expect.stringContaining('Platform:'),
  ]);
});
