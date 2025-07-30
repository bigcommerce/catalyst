import { Command, Option } from 'commander';
import consola from 'consola';
import z from 'zod';

import { ProjectConfig } from '../lib/project-config';

const fetchProjectsSchema = z.object({
  data: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
    }),
  ),
});

async function fetchProjects(storeHash: string, accessToken: string, apiHost: string) {
  const response = await fetch(`https://${apiHost}/stores/${storeHash}/v3/headless/projects`, {
    method: 'GET',
    headers: {
      'X-Auth-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  const res: unknown = await response.json();

  const { data } = fetchProjectsSchema.parse(res);

  return data;
}

export const link = new Command('link')
  .description('Link your local Catalyst repository to a BigCommerce project')
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('BIGCOMMERCE_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('BIGCOMMERCE_ACCESS_TOKEN'),
  )
  .addOption(
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .option(
    '--project-uuid <uuid>',
    'BigCommerce headless project UUID. Can be found via the BigCommerce API (GET /v3/headless/projects).',
  )
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (options) => {
    try {
      const config = new ProjectConfig(options.rootDir);

      if (options.projectUuid) {
        consola.start('Project UUID provided, writing to .bigcommerce/project.json...');
        config.set('projectUuid', options.projectUuid);
        config.set('framework', 'catalyst');
        consola.success('Project UUID written to .bigcommerce/project.json.');

        process.exit(0);
      }

      if (options.storeHash && options.accessToken) {
        consola.start('Fetching projects...');

        const projects = await fetchProjects(
          options.storeHash,
          options.accessToken,
          options.apiHost,
        );

        consola.success('Projects fetched.');

        const projectUuid = await consola.prompt('Select a project (Press <enter> to select).', {
          type: 'select',
          options: projects.map((project) => ({
            label: project.name,
            value: project.uuid,
            hint: project.uuid,
          })),
          cancel: 'reject',
        });

        consola.start('Writing project UUID to .bigcommerce/project.json...');
        config.set('projectUuid', projectUuid);
        config.set('framework', 'catalyst');
        consola.success('Project UUID written to .bigcommerce/project.json.');
        process.exit(0);
      }

      consola.error('No project UUID provided');
      consola.info('Please provide a project UUID using the --project-uuid flag');
      consola.info(
        'Or provide a store hash and access token using the --store-hash and --access-token flags',
      );
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }

    process.exit(1);
  });
