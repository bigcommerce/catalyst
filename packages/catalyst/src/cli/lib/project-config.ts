import Conf from 'conf';
import { join } from 'path';

export interface ProjectConfigSchema {
  projectUuid: string;
  // Reserved for future use
  framework: 'catalyst';
  storeHash?: string;
  accessToken?: string;
  // Persistent deployment environment variables (KEY -> VALUE). Every entry is
  // sent to the deployment as a `secret` by `catalyst deploy`. Managed via the
  // `catalyst env` commands. Lives here (gitignored .bigcommerce/project.json)
  // so users don't have to re-pass `--secret` on every deploy.
  env?: Record<string, string>;
}

export function getProjectConfig() {
  return new Conf<ProjectConfigSchema>({
    cwd: join(process.cwd(), '.bigcommerce'),
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
      env: {
        type: 'object',
        additionalProperties: { type: 'string' },
        default: {},
      },
    },
  });
}
