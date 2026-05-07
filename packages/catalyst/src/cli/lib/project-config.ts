import Conf from 'conf';
import { join } from 'path';

export interface ProjectConfigSchema {
  projectUuid: string;
  // Reserved for future use
  framework: 'catalyst';
  storeHash?: string;
  accessToken?: string;
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
    },
  });
}
