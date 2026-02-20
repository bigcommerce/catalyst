import { Command } from '@effect/cli';
import { Effect } from 'effect';
import { join } from 'node:path';

import { ProcessRunner } from '../providers/services/ProcessRunner';

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

export const startCommand = Command.make('start', {}, () => startEffect).pipe(
  Command.withDescription(
    'Start a local preview of your Catalyst storefront using the OpenNext Cloudflare adapter.',
  ),
);
