import { NodeContext } from '@effect/platform-node';
import { execa } from 'execa';
import { Effect, Layer } from 'effect';
import { expect, test, vi } from 'vitest';

import { LiveLayer } from '../layers';
import { cli } from './root';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
vi.spyOn(process, 'exit').mockImplementation(() => null as never);

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
}));

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({ stdout: '' })),
  __esModule: true,
}));

const AppLayer = Layer.mergeAll(LiveLayer, NodeContext.layer);

test('calls execa with Next.js build if framework is nextjs', async () => {
  await Effect.runPromise(
    cli([
      'node',
      'catalyst',
      'build',
      '--framework',
      'nextjs',
      '--',
      '--debug',
    ]).pipe(Effect.provide(AppLayer)),
  );

  expect(execa).toHaveBeenCalledWith(
    'node_modules/.bin/next',
    ['build', '--debug'],
    expect.objectContaining({
      stdio: 'inherit',
      cwd: process.cwd(),
    }),
  );
});
