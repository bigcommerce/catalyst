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

  if (response.status === 404) {
    throw new Error(
      'Headless Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  const res: unknown = await response.json();

  const { data } = fetchProjectsSchema.parse(res);

  return data;
}

export const link = new Command('link')
  .description(
    'Link your local Catalyst project to a BigCommerce headless project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
  )
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
    'BigCommerce headless project UUID. Can be found via the BigCommerce API (GET /v3/headless/projects). Use this to link directly without fetching projects.',
  )
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (options) => {
    try {
      const config = new ProjectConfig(options.rootDir);

      const writeProjectConfig = (uuid: string) => {
        consola.start('Writing project UUID to .bigcommerce/project.json...');
        config.set('projectUuid', uuid);
        config.set('framework', 'catalyst');
        consola.success('Project UUID written to .bigcommerce/project.json.');
      };

      if (options.projectUuid) {
        writeProjectConfig(options.projectUuid);

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

        if (!projects.length) {
          throw new Error('No headless projects found for this store.');
        }

        const projectUuid = await consola.prompt('Select a project (Press <enter> to select).', {
          type: 'select',
          options: projects.map((project) => ({
            label: project.name,
            value: project.uuid,
            hint: project.uuid,
          })),
          cancel: 'reject',
        });

        writeProjectConfig(projectUuid);

        process.exit(0);
      }

      consola.error('Insufficient information to link a project.');
      consola.info('Provide a project UUID with --project-uuid, or');
      consola.info('Provide both --store-hash and --access-token to fetch and select a project.');
      process.exit(1);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
