import Conf from 'conf';
import { join } from 'path';

export interface ProjectConfigSchema {
  projectId: string;
}

export class ProjectConfig {
  private config: Conf<ProjectConfigSchema>;

  constructor(rootDir = process.cwd()) {
    this.config = new Conf<ProjectConfigSchema>({
      cwd: join(rootDir, '.bigcommerce'),
      projectSuffix: '',
      configName: 'project',
      schema: {
        projectId: { type: 'string', format: 'uuid' },
      },
    });
  }

  get(field: keyof ProjectConfigSchema): string {
    const value = this.config.get(field);

    if (!value) {
      throw new Error(`No '${field}' found in .bigcommerce/project.json.`);
    }

    return value;
  }

  set(field: string, value: string): void {
    this.config.set(field, value);
  }
}
