import { Command, Option } from 'commander';

import { consola } from '../lib/logger';
import { createProject, fetchProjects } from '../lib/project';
import { getProjectConfig } from '../lib/project-config';
import { Telemetry } from '../lib/telemetry';

const telemetry = new Telemetry();

const list = new Command('list')
  .description('List BigCommerce infrastructure projects for your store.')
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel. Can also be set via the CATALYST_STORE_HASH environment variable.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account. Can also be set via the CATALYST_ACCESS_TOKEN environment variable.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .action(async (options) => {
    try {
      if (!options.storeHash || !options.accessToken) {
        consola.error('Insufficient information to list projects.');
        consola.info('This command requires a combination of store hash and access token.');
        consola.info(
          'Store hash and access token: each can be set via its flag (--store-hash, --access-token) or the corresponding environment variable (CATALYST_STORE_HASH, CATALYST_ACCESS_TOKEN).',
        );
        process.exit(1);

        return;
      }

      await telemetry.identify(options.storeHash);

      consola.start('Fetching projects...');

      const projects = await fetchProjects(options.storeHash, options.accessToken, options.apiHost);

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
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

const create = new Command('create')
  .description(
    'Create a new BigCommerce infrastructure project and link it to your local Catalyst project.',
  )
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel. Can also be set via the CATALYST_STORE_HASH environment variable.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account. Can also be set via the CATALYST_ACCESS_TOKEN environment variable.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (options) => {
    try {
      if (!options.storeHash || !options.accessToken) {
        consola.error('Insufficient information to create a project.');
        consola.info('This command requires a combination of store hash and access token.');
        consola.info(
          'Store hash and access token: each can be set via its flag (--store-hash, --access-token) or the corresponding environment variable (CATALYST_STORE_HASH, CATALYST_ACCESS_TOKEN).',
        );
        process.exit(1);

        return;
      }

      await telemetry.identify(options.storeHash);

      const newProjectName = await consola.prompt('Enter a name for the new project:', {
        type: 'text',
      });

      const data = await createProject(
        newProjectName,
        options.storeHash,
        options.accessToken,
        options.apiHost,
      );

      consola.success(`Project "${data.name}" created successfully.`);

      const config = getProjectConfig(options.rootDir);

      consola.start('Writing project UUID to .bigcommerce/project.json...');
      config.set('projectUuid', data.uuid);
      config.set('framework', 'catalyst');
      config.set('storeHash', options.storeHash);
      config.set('accessToken', options.accessToken);
      consola.success('Project UUID written to .bigcommerce/project.json.');

      process.exit(0);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const link = new Command('link')
  .description(
    'Link your local Catalyst project to a BigCommerce infrastructure project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
  )
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel. Can also be set via the CATALYST_STORE_HASH environment variable.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account. Can also be set via the CATALYST_ACCESS_TOKEN environment variable.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .option(
    '--project-uuid <uuid>',
    'BigCommerce infrastructure project UUID. Can be found via the BigCommerce API (GET /v3/infrastructure/projects). Use this to link directly without fetching projects. Can also be set via the CATALYST_PROJECT_UUID environment variable.',
  )
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (options) => {
    try {
      const config = getProjectConfig(options.rootDir);

      const writeProjectConfig = (
        uuid: string,
        opts?: { storeHash?: string; accessToken?: string },
      ) => {
        consola.start('Writing project UUID to .bigcommerce/project.json...');
        config.set('projectUuid', uuid);
        config.set('framework', 'catalyst');
        if (opts?.storeHash !== undefined) {
          config.set('storeHash', opts.storeHash);
        }
        if (opts?.accessToken !== undefined) {
          config.set('accessToken', opts.accessToken);
        }
        consola.success('Project UUID written to .bigcommerce/project.json.');
      };

      if (options.projectUuid) {
        writeProjectConfig(options.projectUuid);

        process.exit(0);
      }

      if (options.storeHash && options.accessToken) {
        await telemetry.identify(options.storeHash);

        consola.start('Fetching projects...');

        const projects = await fetchProjects(
          options.storeHash,
          options.accessToken,
          options.apiHost,
        );

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

          const data = await createProject(
            newProjectName,
            options.storeHash,
            options.accessToken,
            options.apiHost,
          );

          projectUuid = data.uuid;

          consola.success(`Project "${data.name}" created successfully.`);
        }

        writeProjectConfig(projectUuid, {
          storeHash: options.storeHash,
          accessToken: options.accessToken,
        });

        process.exit(0);
      }

      consola.error('Insufficient information to link a project.');
      consola.info(
        'This command requires either a project UUID or a combination of store hash and access token.',
      );
      consola.info(
        'Project UUID: use the --project-uuid flag or the CATALYST_PROJECT_UUID environment variable.',
      );
      consola.info(
        'Store hash and access token: each can be set via its flag (--store-hash, --access-token) or the corresponding environment variable (CATALYST_STORE_HASH, CATALYST_ACCESS_TOKEN).',
      );
      process.exit(1);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const project = new Command('project')
  .description('Manage your BigCommerce infrastructure project.')
  .addCommand(create)
  .addCommand(list)
  .addCommand(link);
