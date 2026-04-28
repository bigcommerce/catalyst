import { Command, Option } from 'commander';

import { consola } from '../lib/logger';
import { createProject, fetchProjects } from '../lib/project';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import { getTelemetry } from '../lib/telemetry';

const list = new Command('list')
  .configureHelp({ showGlobalOptions: true })
  .description('List BigCommerce infrastructure projects for your store.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst project list`,
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
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com')
      .hideHelp(),
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    consola.start('Fetching projects...');

    const projects = await fetchProjects(storeHash, accessToken, options.apiHost);

    consola.success('Projects fetched.');

    if (projects.length === 0) {
      consola.info('No projects found.');
      process.exit(0);

      return;
    }

    projects.forEach((p) => {
      consola.log(`${p.name} (${p.uuid})`);
    });

    process.exit(0);
  });

const create = new Command('create')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Create a new BigCommerce infrastructure project and link it to your local Catalyst project.',
  )
  .addHelpText(
    'after',
    `
Example:
  $ catalyst project create`,
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
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com')
      .hideHelp(),
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    const newProjectName = await consola.prompt('Enter a name for the new project:', {
      type: 'text',
    });

    const data = await createProject(newProjectName, storeHash, accessToken, options.apiHost);

    consola.success(`Project "${data.name}" created successfully.`);

    consola.start('Writing project UUID to .bigcommerce/project.json...');
    config.set('projectUuid', data.uuid);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);
    consola.success('Project UUID written to .bigcommerce/project.json.');

    process.exit(0);
  });

export const link = new Command('link')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Link your local Catalyst project to a BigCommerce infrastructure project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Link interactively (prompts to select or create)
  $ catalyst project link

  # Link using a project UUID directly
  $ catalyst project link --project-uuid <UUID>`,
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
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com')
      .hideHelp(),
  )
  .option(
    '--project-uuid <uuid>',
    'BigCommerce infrastructure project UUID. Can be found via the BigCommerce API (GET /v3/infrastructure/projects). Use this to link directly without fetching projects.',
  )
  .action(async (options) => {
    const config = getProjectConfig();

    const writeProjectConfig = (
      uuid: string,
      credentials?: { storeHash: string; accessToken: string },
    ) => {
      consola.start('Writing project UUID to .bigcommerce/project.json...');
      config.set('projectUuid', uuid);

      if (credentials) {
        config.set('storeHash', credentials.storeHash);
        config.set('accessToken', credentials.accessToken);
      }

      consola.success('Project UUID written to .bigcommerce/project.json.');
    };

    if (options.projectUuid) {
      writeProjectConfig(options.projectUuid);

      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    consola.start('Fetching projects...');

    const projects = await fetchProjects(storeHash, accessToken, options.apiHost);

    consola.success('Projects fetched.');

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

    let projectUuid = await consola.prompt(
      'Select a project or create a new project (Press <enter> to select).',
      {
        type: 'select',
        options: promptOptions,
        cancel: 'reject',
      },
    );

    if (projectUuid === 'create') {
      const newProjectName = await consola.prompt('Enter a name for the new project:', {
        type: 'text',
      });

      const data = await createProject(newProjectName, storeHash, accessToken, options.apiHost);

      projectUuid = data.uuid;

      consola.success(`Project "${data.name}" created successfully.`);
    }

    writeProjectConfig(projectUuid, { storeHash, accessToken });

    process.exit(0);
  });

export const project = new Command('project')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage your BigCommerce infrastructure project.')
  .addCommand(create)
  .addCommand(list)
  .addCommand(link);
