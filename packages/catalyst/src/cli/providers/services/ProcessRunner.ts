import { Context, Effect, Layer } from 'effect';
import { execa, type Options as ExecaOptions, type ResultPromise } from 'execa';

import { ProcessRunnerError } from '../../core/errors';

export interface ExecResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

export class ProcessRunner extends Context.Tag('@catalyst/ProcessRunner')<
  ProcessRunner,
  {
    readonly exec: (
      bin: string,
      args: string[],
      opts?: ExecaOptions,
    ) => Effect.Effect<ExecResult, ProcessRunnerError>;
  }
>() {}

export const ProcessRunnerLive = Layer.succeed(ProcessRunner, {
  exec: (bin, args, opts) =>
    Effect.tryPromise({
      try: () => execa(bin, args, opts) as ResultPromise<ExecaOptions>,
      catch: (error) =>
        new ProcessRunnerError({
          message: error instanceof Error ? error.message : String(error),
          exitCode: typeof error === 'object' && error !== null && 'exitCode' in error
            ? (error as { exitCode: number }).exitCode
            : undefined,
        }),
    }).pipe(
      Effect.map((result) => ({
        stdout: typeof result.stdout === 'string' ? result.stdout : '',
        stderr: typeof result.stderr === 'string' ? result.stderr : '',
        exitCode: result.exitCode ?? 0,
      })),
    ),
});
