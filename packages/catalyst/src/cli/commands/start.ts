import { Command } from 'commander';
import { Effect } from 'effect';
import { join } from 'node:path';

import { ProcessRunner } from '../providers/services/ProcessRunner';
import { ProvidersLive } from '../providers/layers';

export const startEffect = Effect.gen(function* () {
  const runner = yield* ProcessRunner;

  yield* runner.exec(
    'pnpm',
    [
      'exec',
      'opennextjs-cloudflare',
      'preview',
      '--config',
      join('.bigcommerce', 'wrangler.jsonc'),
    ],
    {
      stdio: 'inherit',
      cwd: process.cwd(),
    },
  );
});

export const start = new Command('start')
  .description(
    'Start a local preview of your Catalyst storefront using the OpenNext Cloudflare adapter.',
  )
  .action(async () =>
    Effect.runPromise(startEffect.pipe(Effect.provide(ProvidersLive))),
  );
