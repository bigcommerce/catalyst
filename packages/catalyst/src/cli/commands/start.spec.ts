import { NodeContext } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { LiveLayer } from '../layers';
import { ProcessRunner } from '../providers/services/ProcessRunner';
import { cli } from './root';

import { startEffect } from './start';

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({ stdout: '', stderr: '', exitCode: 0 })),
  __esModule: true,
}));

const AppLayer = Layer.mergeAll(LiveLayer, NodeContext.layer);

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

test('calls execa with OpenNext production optimized server', async () => {
  const { execa } = await import('execa');

  await Effect.runPromise(
    cli(['node', 'catalyst', 'start']).pipe(Effect.provide(AppLayer)),
  );

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    ['exec', 'opennextjs-cloudflare', 'preview', '--config', '.bigcommerce/wrangler.jsonc'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});

test('startEffect uses ProcessRunner service', async () => {
  const calls: Array<{ bin: string; args: string[] }> = [];

  const TestProcessRunner = Layer.succeed(ProcessRunner, {
    exec: (bin, args) => {
      calls.push({ bin, args });

      return Effect.succeed({ stdout: '', stderr: '', exitCode: 0 });
    },
  });

  await Effect.runPromise(
    startEffect.pipe(Effect.provide(TestProcessRunner)),
  );

  expect(calls).toEqual([
    {
      bin: 'pnpm',
      args: [
        'exec',
        'opennextjs-cloudflare',
        'preview',
        '--config',
        '.bigcommerce/wrangler.jsonc',
      ],
    },
  ]);
});
