import { Args, Command, Options } from '@effect/cli';
import { Config, Effect, Option } from 'effect';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { BuildService } from '../core/services/BuildService';
import { ProcessRunner } from '../providers/services/ProcessRunner';
import { ProjectConfig } from '../providers/services/ProjectConfig';
import { Logger } from '../presentation/services/Logger';

const buildArgs = Args.text({ name: 'next-build-options' }).pipe(
  Args.withDescription(
    'Next.js `build` options (see: https://nextjs.org/docs/app/api-reference/cli/next#next-build-options). Use -- before flags.',
  ),
  Args.repeated,
);

const projectUuidOption = Options.text('project-uuid').pipe(
  Options.withDescription(
    'Project UUID to be included in the deployment configuration.',
  ),
  Options.withFallbackConfig(Config.string('CATALYST_PROJECT_UUID')),
  Options.optional,
);

const frameworkOption = Options.choice('framework', [
  'nextjs',
  'catalyst',
]).pipe(
  Options.withDescription('The framework to use for the build.'),
  Options.optional,
);

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

export const buildCommand = Command.make(
  'build',
  {
    buildArgs,
    projectUuid: projectUuidOption,
    framework: frameworkOption,
  },
  ({ buildArgs: args, projectUuid, framework }) =>
    buildEffect(args, {
      framework: Option.getOrUndefined(framework),
      projectUuid: Option.getOrUndefined(projectUuid),
    }),
);
