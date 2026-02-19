import { Context, Effect, Layer } from 'effect';
import { copyFile, cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { BuildError } from '../errors';
import { ProcessRunner } from '../../providers/services/ProcessRunner';
import { getModuleCliPath } from '../../lib/get-module-cli-path';
import { getWranglerConfig } from '../../lib/wrangler-config';

const WRANGLER_VERSION = '4.24.3';

export class BuildService extends Context.Tag('@catalyst/BuildService')<
  BuildService,
  {
    readonly buildCatalyst: (
      projectUuid: string,
    ) => Effect.Effect<void, BuildError>;
  }
>() {}

export const BuildServiceLive = Layer.effect(
  BuildService,
  Effect.gen(function* () {
    const runner = yield* ProcessRunner;

    return {
      buildCatalyst: (projectUuid) =>
        Effect.gen(function* () {
          const coreDir = process.cwd();
          const openNextOutDir = join(coreDir, '.open-next');
          const bigcommerceDistDir = join(coreDir, '.bigcommerce', 'dist');

          const wranglerConfig = getWranglerConfig(projectUuid);

          yield* Effect.tryPromise({
            try: () =>
              copyFile(
                join(getModuleCliPath(), 'templates', 'open-next.config.ts'),
                join(coreDir, '.bigcommerce', 'open-next.config.ts'),
              ),
            catch: (error) =>
              new BuildError({
                message: `Failed to copy templates: ${error instanceof Error ? error.message : String(error)}`,
              }),
          });

          yield* Effect.tryPromise({
            try: () =>
              writeFile(
                join(coreDir, '.bigcommerce', 'wrangler.jsonc'),
                JSON.stringify(wranglerConfig, null, 2),
              ),
            catch: (error) =>
              new BuildError({
                message: `Failed to write wrangler config: ${error instanceof Error ? error.message : String(error)}`,
              }),
          });

          yield* runner
            .exec(
              'pnpm',
              [
                'exec',
                'opennextjs-cloudflare',
                'build',
                '--skipWranglerConfigCheck',
                '--openNextConfigPath',
                join(coreDir, '.bigcommerce', 'open-next.config.ts'),
              ],
              {
                stdout: ['pipe', 'inherit'],
                cwd: coreDir,
              },
            )
            .pipe(
              Effect.mapError(
                (e) => new BuildError({ message: `Build failed: ${e.message}` }),
              ),
            );

          yield* runner
            .exec(
              'pnpm',
              [
                'dlx',
                `wrangler@${WRANGLER_VERSION}`,
                'deploy',
                '--config',
                join(coreDir, '.bigcommerce', 'wrangler.jsonc'),
                '--keep-vars',
                '--outdir',
                bigcommerceDistDir,
                '--dry-run',
              ],
              {
                stdout: ['pipe', 'inherit'],
                cwd: coreDir,
              },
            )
            .pipe(
              Effect.mapError(
                (e) =>
                  new BuildError({
                    message: `Wrangler deploy failed: ${e.message}`,
                  }),
              ),
            );

          yield* Effect.tryPromise({
            try: () =>
              cp(
                join(openNextOutDir, 'assets'),
                join(bigcommerceDistDir, 'assets'),
                { recursive: true, force: true },
              ),
            catch: (error) =>
              new BuildError({
                message: `Failed to copy assets: ${error instanceof Error ? error.message : String(error)}`,
              }),
          });
        }),
    };
  }),
);
