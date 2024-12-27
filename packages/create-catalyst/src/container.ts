import { BigCommerceServiceImpl } from './services/bigcommerce';
import { GitServiceImpl } from './services/git';
import { ProjectServiceImpl } from './services/project';

interface Config {
  bigCommerceHostname: string;
  cliApiHostname: string;
}

interface Container {
  getProjectService: () => ProjectServiceImpl;
}

export function createContainer(config: Config): Container {
  const gitService = new GitServiceImpl();
  const bigCommerceService = new BigCommerceServiceImpl({
    bigCommerceApiUrl: `https://api.${config.bigCommerceHostname}`,
    bigCommerceAuthUrl: `https://login.${config.bigCommerceHostname}`,
    cliApiUrl: `https://${config.cliApiHostname}`,
  });

  return {
    getProjectService: () => new ProjectServiceImpl(gitService, bigCommerceService),
  };
}
