import { Config } from './types';
import { GitServiceImpl } from './services/git';
import { BigCommerceServiceImpl } from './services/bigcommerce';
import { ProjectServiceImpl } from './services/project';

export class Container {
  private config: Config;
  private gitService: GitServiceImpl;
  private bigCommerceService: BigCommerceServiceImpl;
  private projectService: ProjectServiceImpl;

  constructor(config: Config) {
    this.config = config;
    this.gitService = new GitServiceImpl();
    this.bigCommerceService = new BigCommerceServiceImpl({
      bigCommerceApiUrl: `https://api.${config.bigCommerceHostname}`,
      bigCommerceAuthUrl: `https://login.${config.bigCommerceHostname}`,
      sampleDataApiUrl: config.sampleDataApiUrl,
    });
    this.projectService = new ProjectServiceImpl(
      this.gitService,
      this.bigCommerceService,
    );
  }

  getGitService(): GitServiceImpl {
    return this.gitService;
  }

  getBigCommerceService(): BigCommerceServiceImpl {
    return this.bigCommerceService;
  }

  getProjectService(): ProjectServiceImpl {
    return this.projectService;
  }
}

export function createContainer(config: Config): Container {
  return new Container(config);
} 