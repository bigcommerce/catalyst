import { NodeContext } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { beforeAll, expect, test, vi } from 'vitest';

import PACKAGE_INFO from '../../../package.json';
import { consola } from '../lib/logger';
import { Logger } from '../presentation/services/Logger';
import { LiveLayer } from '../layers';
import { cli } from './root';

import { versionEffect } from './version';

const AppLayer = Layer.mergeAll(LiveLayer, NodeContext.layer);

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

test('displays version information when executed', async () => {
  await Effect.runPromise(
    cli(['node', 'catalyst', 'version']).pipe(Effect.provide(AppLayer)),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining('Version Information:'),
  );

  expect(consola.log).toHaveBeenCalledWith(
    expect.stringContaining(`CLI Version: ${PACKAGE_INFO.version}`),
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
