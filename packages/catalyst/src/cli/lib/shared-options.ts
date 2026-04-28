import { Option } from 'commander';

import { getProjectConfig } from './project-config';

export const storeHashOption = () =>
  new Option(
    '--store-hash <hash>',
    'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
  ).env('CATALYST_STORE_HASH');

export const accessTokenOption = () =>
  new Option(
    '--access-token <token>',
    'BigCommerce access token. Can be found after creating a store-level API account.',
  ).env('CATALYST_ACCESS_TOKEN');

export const apiHostOption = () =>
  new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
    .env('BIGCOMMERCE_API_HOST')
    .default('api.bigcommerce.com')
    .hideHelp();

export const projectUuidOption = () =>
  new Option(
    '--project-uuid <uuid>',
    'BigCommerce infrastructure project UUID. Can be found via the BigCommerce API (GET /v3/infrastructure/projects).',
  ).env('BIGCOMMERCE_PROJECT_UUID');

export const resolveProjectUuid = (options: { projectUuid?: string }) => {
  const config = getProjectConfig();
  const projectUuid = options.projectUuid ?? config.get('projectUuid');

  if (!projectUuid) {
    throw new Error(
      'Project UUID is required. Please run either `catalyst project link` or `catalyst project create` or this command again with --project-uuid <uuid>.',
    );
  }

  return projectUuid;
};
