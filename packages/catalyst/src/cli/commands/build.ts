import { Command, Option } from 'commander';
import { Effect } from 'effect';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { BuildService } from '../core/services/BuildService';
import { ProcessRunner } from '../providers/services/ProcessRunner';
import { ProjectConfig } from '../providers/services/ProjectConfig';
import { Logger } from '../presentation/services/Logger';
import { LiveLayer } from '../layers';

export const buildCatalystEffect = (projectUuid: string) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const buildService = yield* BuildService;

    yield* logger.start('Copying templates...');
    yield* logger.start('Building project...');

    yield* buildService.buildCatalyst(projectUuid);

    yield* logger.success('Project built');
  });

export const buildEffect = (
  nextBuildOptions: string[],
  options: { framework?: string; projectUuid?: string },
) =>
  Effect.gen(function* () {
    const runner = yield* ProcessRunner;
    const config = yield* ProjectConfig;

    const coreDir = process.cwd();
    const framework = options.framework ?? (yield* config.get('framework'));

    if (framework === 'nextjs') {
      const nextBin = join('node_modules', '.bin', 'next');

      if (!existsSync(nextBin)) {
        throw new Error(
          `Next.js is not installed in ${coreDir}. Are you in a valid Next.js project?`,
        );
      }

      yield* runner.exec(nextBin, ['build', ...nextBuildOptions], {
        stdio: 'inherit',
        cwd: coreDir,
      });
    }

    if (framework === 'catalyst') {
      const projectUuid =
        options.projectUuid ?? (yield* config.get('projectUuid'));

      if (!projectUuid) {
        throw new Error(
          'Project UUID is required. Please run `catalyst project create` or `catalyst project link` or this command again with --project-uuid <uuid>.',
        );
      }

      yield* buildCatalystEffect(projectUuid);
    }
  });

export { buildCatalystEffect as buildCatalystProject };

export const build = new Command('build')
  .allowUnknownOption()
  .argument(
    '[next-build-options...]',
    'Next.js `build` options (see: https://nextjs.org/docs/app/api-reference/cli/next#next-build-options)',
  )
  .addOption(
    new Option(
      '--project-uuid <uuid>',
      'Project UUID to be included in the deployment configuration.',
    ).env('CATALYST_PROJECT_UUID'),
  )
  .addOption(
    new Option(
      '--framework <framework>',
      'The framework to use for the build.',
    ).choices(['nextjs', 'catalyst']),
  )
  .action(async (nextBuildOptions, options) =>
    Effect.runPromise(
      buildEffect(nextBuildOptions, options).pipe(Effect.provide(LiveLayer)),
    ),
  );
