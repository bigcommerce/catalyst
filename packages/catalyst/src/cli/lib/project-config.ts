import Conf from 'conf';
import { join } from 'path';

export interface ProjectConfigSchema {
  projectUuid: string;
  framework: 'catalyst' | 'nextjs';
  telemetry: {
    enabled: boolean;
    anonymousId: string;
  };
}

export function getProjectConfig(rootDir = process.cwd()) {
  return new Conf<ProjectConfigSchema>({
    cwd: join(rootDir, '.bigcommerce'),
    projectSuffix: '',
    configName: 'project',
    schema: {
      projectUuid: { type: 'string', format: 'uuid' },
      framework: {
        type: 'string',
        enum: ['catalyst', 'nextjs'],
        default: 'nextjs',
      },
      telemetry: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          anonymousId: { type: 'string' },
        },
      },
    },
  });
}
