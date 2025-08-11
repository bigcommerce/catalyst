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

export class ProjectConfig {
  private config: Conf<ProjectConfigSchema>;

  constructor(rootDir = process.cwd()) {
    this.config = new Conf<ProjectConfigSchema>({
      cwd: join(rootDir, '.bigcommerce'),
      projectSuffix: '',
      configName: 'project',
      schema: {
        projectUuid: { type: 'string', format: 'uuid' },
        framework: {
          type: 'string',
          enum: ['catalyst', 'nextjs'],
          default: 'catalyst',
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

  get<T extends keyof ProjectConfigSchema>(field: T): ProjectConfigSchema[T] {
    const value = this.config.get(field);

    if (!value) {
      throw new Error(`No \`${field}\` found in .bigcommerce/project.json.`);
    }

    return value;
  }

  set(field: string, value: string | boolean): void {
    this.config.set(field, value);
  }
}
