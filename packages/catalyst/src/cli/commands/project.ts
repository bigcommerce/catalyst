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
      const config = getProjectConfig();
      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');

      if (!storeHash || !accessToken) {
        consola.error('Insufficient information to list projects.');
        consola.info('This command requires a combination of store hash and access token.');
        consola.info(
          'Store hash and access token: Can be set via the --store-hash and --access-token flags, the CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables, or the storeHash and accessToken properties in the .bigcommerce/project.json file.',
        );
        process.exit(1);

        return;
      }

      await telemetry.identify(storeHash);

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
      const config = getProjectConfig(options.rootDir);
      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');

      if (!storeHash || !accessToken) {
        consola.error('Insufficient information to create a project.');
        consola.info('This command requires a combination of store hash and access token.');
        consola.info(
          'Store hash and access token: Can be set via the --store-hash and --access-token flags, the CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables, or the storeHash and accessToken properties in the .bigcommerce/project.json file.',
        );
        process.exit(1);

        return;
      }

      await telemetry.identify(storeHash);

      const newProjectName = await consola.prompt('Enter a name for the new project:', {
        type: 'text',
      });

      const data = await createProject(
        newProjectName,
        storeHash,
        accessToken,
        options.apiHost,
      );

      consola.success(`Project "${data.name}" created successfully.`);

      consola.start('Writing project UUID to .bigcommerce/project.json...');
      config.set('projectUuid', data.uuid);
      config.set('framework', 'catalyst');
      config.set('storeHash', storeHash);
      config.set('accessToken', accessToken);
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

      const storeHash = options.storeHash ?? config.get('storeHash');
      const accessToken = options.accessToken ?? config.get('accessToken');

      if (options.projectUuid) {
        writeProjectConfig(options.projectUuid);

        process.exit(0);
      }

      if (storeHash && accessToken) {
        await telemetry.identify(storeHash);

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

          const data = await createProject(
            newProjectName,
            storeHash,
            accessToken,
            options.apiHost,
          );

          projectUuid = data.uuid;

          consola.success(`Project "${data.name}" created successfully.`);
        }

        writeProjectConfig(projectUuid, {
          storeHash,
          accessToken,
        });

        process.exit(0);
      }

      consola.error('Insufficient information to link a project.');
      consola.info(
        'This command requires either a project UUID or a combination of store hash and access token.',
      );
      consola.info(
        'Project UUID: This can be set via the --project-uuid flag, the CATALYST_PROJECT_UUID environment variable, or the projectUuid property in the .bigcommerce/project.json file.',
      );
      consola.info(
        'Store hash and access token: Can be set via the --store-hash and --access-token flags, the CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables, or the storeHash and accessToken properties in the .bigcommerce/project.json file.',
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
