import { Context, Effect, Layer } from 'effect';

import { consola } from '../../lib/logger';

export class Logger extends Context.Tag('@catalyst/Logger')<
  Logger,
  {
    readonly log: (message: string) => Effect.Effect<void>;
    readonly info: (message: string) => Effect.Effect<void>;
    readonly success: (message: string) => Effect.Effect<void>;
    readonly error: (message: string) => Effect.Effect<void>;
    readonly warn: (message: string) => Effect.Effect<void>;
    readonly start: (message: string) => Effect.Effect<void>;
    readonly prompt: (
      message: string,
      options: { type: 'text' } | { type: 'select'; options: Array<{ label: string; value: string; hint?: string }>; cancel?: 'symbol' | 'undefined' | 'default' | 'null' | 'reject' },
    ) => Effect.Effect<string>;
  }
>() {}

export const LoggerLive = Layer.succeed(Logger, {
  log: (message) => Effect.sync(() => consola.log(message)),
  info: (message) => Effect.sync(() => consola.info(message)),
  success: (message) => Effect.sync(() => consola.success(message)),
  error: (message) => Effect.sync(() => consola.error(message)),
  warn: (message) => Effect.sync(() => consola.warn(message)),
  start: (message) => Effect.sync(() => consola.start(message)),
  prompt: (message, options) =>
    Effect.promise(() => consola.prompt(message, options) as Promise<string>),
});
