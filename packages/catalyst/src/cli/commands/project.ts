import { Command, Options } from '@effect/cli';
import { Config, Effect, Option } from 'effect';

import { ProjectService } from '../core/services/ProjectService';
import { ProjectConfig } from '../providers/services/ProjectConfig';
import { Telemetry } from '../providers/services/Telemetry';
import { Logger } from '../presentation/services/Logger';

const storeHashOption = Options.text('store-hash').pipe(
  Options.withDescription(
    'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
  ),
  Options.withFallbackConfig(Config.string('CATALYST_STORE_HASH')),
  Options.optional,
);

const accessTokenOption = Options.text('access-token').pipe(
  Options.withDescription(
    'BigCommerce access token. Can be found after creating a store-level API account.',
  ),
  Options.withFallbackConfig(Config.string('CATALYST_ACCESS_TOKEN')),
  Options.optional,
);

const apiHostOption = Options.text('api-host').pipe(
  Options.withDescription(
    'BigCommerce API host. The default is api.bigcommerce.com.',
  ),
  Options.withFallbackConfig(Config.string('BIGCOMMERCE_API_HOST')),
  Options.withDefault('api.bigcommerce.com'),
);

const projectUuidOption = Options.text('project-uuid').pipe(
  Options.withDescription(
    'BigCommerce infrastructure project UUID. Can be found via the BigCommerce API (GET /v3/infrastructure/projects). Use this to link directly without fetching projects.',
  ),
  Options.optional,
);

export const listEffect = (options: {
  storeHash?: string;
  accessToken?: string;
  apiHost: string;
}) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const project = yield* ProjectService;
    const telemetry = yield* Telemetry;

    const { storeHash, accessToken } = yield* project
      .resolveCredentials(options)
      .pipe(
        Effect.catchTag('MissingCredentialsError', (e) =>
          Effect.gen(function* () {
            yield* logger.error('Missing credentials.');
            yield* logger.info(
              'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
            );
            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    yield* telemetry.identify(storeHash);

    yield* logger.start('Fetching projects...');

    const projects = yield* project.fetchProjects(
      storeHash,
      accessToken,
      options.apiHost,
    );

    yield* logger.success('Projects fetched.');

    if (projects.length === 0) {
      yield* logger.info('No projects found.');
      process.exit(0);

      return;
    }

    for (const p of projects) {
      yield* logger.log(`${p.name} (${p.uuid})`);
    }

    process.exit(0);
  });

export const createEffect = (options: {
  storeHash?: string;
  accessToken?: string;
  apiHost: string;
}) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const project = yield* ProjectService;
    const config = yield* ProjectConfig;
    const telemetry = yield* Telemetry;

    const { storeHash, accessToken } = yield* project
      .resolveCredentials(options)
      .pipe(
        Effect.catchTag('MissingCredentialsError', (e) =>
          Effect.gen(function* () {
            yield* logger.error('Missing credentials.');
            yield* logger.info(
              'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
            );
            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    yield* telemetry.identify(storeHash);

    const newProjectName = yield* logger.prompt(
      'Enter a name for the new project:',
      { type: 'text' },
    );

    const data = yield* project.createProject(
      newProjectName,
      storeHash,
      accessToken,
      options.apiHost,
    );

    yield* logger.success(`Project "${data.name}" created successfully.`);

    yield* logger.start('Writing project UUID to .bigcommerce/project.json...');
    yield* config.set('projectUuid', data.uuid);
    yield* config.set('framework', 'catalyst');
    yield* config.set('storeHash', storeHash);
    yield* config.set('accessToken', accessToken);
    yield* logger.success('Project UUID written to .bigcommerce/project.json.');

    process.exit(0);
  });

export const linkEffect = (options: {
  storeHash?: string;
  accessToken?: string;
  apiHost: string;
  projectUuid?: string;
}) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const project = yield* ProjectService;
    const config = yield* ProjectConfig;
    const telemetry = yield* Telemetry;

    const writeProjectConfig = (
      uuid: string,
      credentials?: { storeHash: string; accessToken: string },
    ) =>
      Effect.gen(function* () {
        yield* logger.start(
          'Writing project UUID to .bigcommerce/project.json...',
        );
        yield* config.set('projectUuid', uuid);
        yield* config.set('framework', 'catalyst');

        if (credentials) {
          yield* config.set('storeHash', credentials.storeHash);
          yield* config.set('accessToken', credentials.accessToken);
        }

        yield* logger.success(
          'Project UUID written to .bigcommerce/project.json.',
        );
      });

    if (options.projectUuid) {
      yield* writeProjectConfig(options.projectUuid);
      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = yield* project
      .resolveCredentials(options)
      .pipe(
        Effect.catchTag('MissingCredentialsError', (e) =>
          Effect.gen(function* () {
            yield* logger.error('Missing credentials.');
            yield* logger.info(
              'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
            );
            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    yield* telemetry.identify(storeHash);

    yield* logger.start('Fetching projects...');

    const projects = yield* project.fetchProjects(
      storeHash,
      accessToken,
      options.apiHost,
    );

    yield* logger.success('Projects fetched.');

    const promptOptions = [
      ...projects.map((proj) => ({
        label: proj.name,
        value: proj.uuid,
        hint: proj.uuid,
      })),
      {
        label: 'Create a new project',
        value: 'create',
        hint: 'Create a new infrastructure project for this BigCommerce store.',
      },
    ];

    let projectUuid = yield* logger.prompt(
      'Select a project or create a new project (Press <enter> to select).',
      {
        type: 'select',
        options: promptOptions,
        cancel: 'reject',
      },
    );

    if (projectUuid === 'create') {
      const newProjectName = yield* logger.prompt(
        'Enter a name for the new project:',
        { type: 'text' },
      );

      const data = yield* project.createProject(
        newProjectName,
        storeHash,
        accessToken,
        options.apiHost,
      );

      projectUuid = data.uuid;

      yield* logger.success(`Project "${data.name}" created successfully.`);
    }

    yield* writeProjectConfig(projectUuid, { storeHash, accessToken });

    process.exit(0);
  });

const listCommand = Command.make(
  'list',
  { storeHash: storeHashOption, accessToken: accessTokenOption, apiHost: apiHostOption },
  (opts) =>
    listEffect({
      storeHash: Option.getOrUndefined(opts.storeHash),
      accessToken: Option.getOrUndefined(opts.accessToken),
      apiHost: opts.apiHost,
    }),
).pipe(
  Command.withDescription(
    'List BigCommerce infrastructure projects for your store.',
  ),
);

const createCommand = Command.make(
  'create',
  {
    storeHash: storeHashOption,
    accessToken: accessTokenOption,
    apiHost: apiHostOption,
  },
  (opts) =>
    createEffect({
      storeHash: Option.getOrUndefined(opts.storeHash),
      accessToken: Option.getOrUndefined(opts.accessToken),
      apiHost: opts.apiHost,
    }),
).pipe(
  Command.withDescription(
    'Create a new BigCommerce infrastructure project and link it to your local Catalyst project.',
  ),
);

export const linkCommand = Command.make(
  'link',
  {
    storeHash: storeHashOption,
    accessToken: accessTokenOption,
    apiHost: apiHostOption,
    projectUuid: projectUuidOption,
  },
  (opts) =>
    linkEffect({
      storeHash: Option.getOrUndefined(opts.storeHash),
      accessToken: Option.getOrUndefined(opts.accessToken),
      apiHost: opts.apiHost,
      projectUuid: Option.getOrUndefined(opts.projectUuid),
    }),
).pipe(
  Command.withDescription(
    'Link your local Catalyst project to a BigCommerce infrastructure project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
  ),
);

export const projectCommand = Command.make('project').pipe(
  Command.withDescription('Manage your BigCommerce infrastructure project.'),
  Command.withSubcommands([createCommand, listCommand, linkCommand]),
);
