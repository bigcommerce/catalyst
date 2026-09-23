import Conf from 'conf';
import { join } from 'path';

export interface ProjectConfigSchema {
  projectUuid: string;
  // Reserved for future use
  framework: 'catalyst';
  storeHash?: string;
  accessToken?: string;
  apiHost?: string;
  // Persistent deployment environment variables (KEY -> VALUE). Every entry is
  // sent to the deployment as a `secret` by `catalyst deploy`. Managed via the
  // `catalyst env` commands. Lives here (gitignored .bigcommerce/project.json)
  // so users don't have to re-pass `--secret` on every deploy.
  env?: Record<string, string>;
}

// `cwd` defaults to the process working directory — the project the user is
// currently in. `catalyst create` passes the freshly-scaffolded project dir
// explicitly, since that project isn't the cwd at the time it's seeded.
export function getProjectConfig(cwd: string = process.cwd()) {
  return new Conf<ProjectConfigSchema>({
    cwd: join(cwd, '.bigcommerce'),
    projectSuffix: '',
    configName: 'project',
    schema: {
      projectUuid: { type: 'string', format: 'uuid' },
      framework: {
        type: 'string',
        enum: ['catalyst'],
        default: 'catalyst',
      },
      storeHash: { type: 'string' },
      accessToken: { type: 'string' },
      apiHost: { type: 'string' },
      env: {
        type: 'object',
        additionalProperties: { type: 'string' },
        default: {},
      },
    },
  });
}
