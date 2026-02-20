import { Command, Option } from 'commander';
import { Effect } from 'effect';

import { ProjectService } from '../core/services/ProjectService';
import { ProjectConfig } from '../providers/services/ProjectConfig';
import { Telemetry } from '../providers/services/Telemetry';
import { Logger } from '../presentation/services/Logger';
import { LiveLayer } from '../layers';

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

const list = new Command('list')
  .description(
    'List BigCommerce infrastructure projects for your store.',
  )
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option(
      '--api-host <host>',
      'BigCommerce API host. The default is api.bigcommerce.com.',
    )
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .action(async (options) =>
    Effect.runPromise(listEffect(options).pipe(Effect.provide(LiveLayer))),
  );

const create = new Command('create')
  .description(
    'Create a new BigCommerce infrastructure project and link it to your local Catalyst project.',
  )
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option(
      '--api-host <host>',
      'BigCommerce API host. The default is api.bigcommerce.com.',
    )
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .action(async (options) =>
    Effect.runPromise(
      createEffect(options).pipe(Effect.provide(LiveLayer)),
    ),
  );

export const link = new Command('link')
  .description(
    'Link your local Catalyst project to a BigCommerce infrastructure project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
  )
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option(
      '--api-host <host>',
      'BigCommerce API host. The default is api.bigcommerce.com.',
    )
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .option(
    '--project-uuid <uuid>',
    'BigCommerce infrastructure project UUID. Can be found via the BigCommerce API (GET /v3/infrastructure/projects). Use this to link directly without fetching projects.',
  )
  .action(async (options) =>
    Effect.runPromise(
      linkEffect(options).pipe(Effect.provide(LiveLayer)),
    ),
  );

export const project = new Command('project')
  .description('Manage your BigCommerce infrastructure project.')
  .addCommand(create)
  .addCommand(list)
  .addCommand(link);
