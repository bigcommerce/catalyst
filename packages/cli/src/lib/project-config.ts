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

  getProjectId(): string {
    const projectId = this.config.get('projectId');

    if (!projectId) {
      throw new Error(
        'No `projectId` found in .bigcommerce/project.json. Please add a valid `projectId` (UUID) to your bigcommerce configuration file.',
      );
    }

    return projectId;
  }

  setProjectId(projectId: string): void {
    this.config.set('projectId', projectId);
  }
}
