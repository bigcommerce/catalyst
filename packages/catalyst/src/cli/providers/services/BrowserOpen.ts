import { Context, Effect, Layer } from 'effect';
import open from 'open';

import { BrowserOpenError } from '../../core/errors';

export class BrowserOpen extends Context.Tag('@catalyst/BrowserOpen')<
  BrowserOpen,
  {
    readonly open: (url: string) => Effect.Effect<void, BrowserOpenError>;
  }
>() {}

export const BrowserOpenLive = Layer.succeed(BrowserOpen, {
  open: (url) =>
    Effect.tryPromise({
      try: () => open(url),
      catch: (error) =>
        new BrowserOpenError({
          message: error instanceof Error ? error.message : String(error),
        }),
    }).pipe(Effect.asVoid),
});
