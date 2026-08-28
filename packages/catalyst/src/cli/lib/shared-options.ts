import { Option } from 'commander';
import type Conf from 'conf';

import { DEFAULT_LOGIN_URL } from './auth';
import { getProjectConfig, ProjectConfigSchema } from './project-config';

export const DEFAULT_API_HOST = 'api.bigcommerce.com';

export const storeHashOption = () =>
  new Option(
    '--store-hash <hash>',
    'BigCommerce store hash. Can be found in the URL of your store Control Panel. Read from .bigcommerce/project.json or .env when not provided.',
  ).env('CATALYST_STORE_HASH');

export const accessTokenOption = () =>
  new Option(
    '--access-token <token>',
    'BigCommerce access token. Can be found after creating a store-level API account. Read from .bigcommerce/project.json or .env when not provided.',
  ).env('CATALYST_ACCESS_TOKEN');

export const apiHostOption = () =>
  new Option(
    '--api-host <host>',
    'BigCommerce API host. Read from .bigcommerce/project.json or CATALYST_API_HOST when not provided. Defaults to api.bigcommerce.com.',
  )
    .env('CATALYST_API_HOST')
    .hideHelp();

export const loginUrlOption = () =>
  new Option('--login-url <url>', 'BigCommerce login URL.')
    .env('BIGCOMMERCE_LOGIN_URL')
    .default(DEFAULT_LOGIN_URL)
    .hideHelp();

export const projectUuidOption = () =>
  new Option(
    '--project-uuid <uuid>',
    'BigCommerce infrastructure project UUID. Read from .bigcommerce/project.json or .env when not provided.',
  ).env('CATALYST_PROJECT_UUID');

export const envPathOption = () =>
  new Option(
    '--env-path <path>',
    'Path to an environment file to load for the build (relative to the current working directory). When omitted, .env.local and .env are auto-loaded from the current directory. Other commands never load env files.',
  );

export const resolveProjectUuid = (options: { projectUuid?: string }) => {
  const config = getProjectConfig();
  const projectUuid = options.projectUuid ?? config.get('projectUuid');

  if (!projectUuid) {
    throw new Error(
      'Project UUID is required. Please run either `catalyst projects link` or `catalyst projects create` or this command again with --project-uuid <uuid>.',
    );
  }

  return projectUuid;
};

export const resolveApiHost = (
  options: { apiHost?: string },
  config: Conf<ProjectConfigSchema>,
): string => options.apiHost ?? config.get('apiHost') ?? DEFAULT_API_HOST;
