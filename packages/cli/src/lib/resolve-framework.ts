import { ConsolaInstance } from 'consola';

interface Options {
  verbose: boolean;
  framework?: 'catalyst' | 'nextjs';
}

type Logger = Pick<ConsolaInstance, 'debug' | 'start' | 'success' | 'fail' | 'info' | 'error'>;
type Config = () => {
  get: (key: 'framework') => 'catalyst' | 'nextjs';
  path: string;
};

export function resolveFramework(options: Options, getConfig: Config, logger: Logger) {
  const config = getConfig();

  if (options.verbose) {
    logger.debug(`Reading config from ${config.path}`);

    if (options.framework) {
      logger.debug(`Using framework from --framework option: ${options.framework}`);
    } else {
      logger.debug(`Using framework from project configuration: ${config.get('framework')}`);
    }
  }

  return options.framework ?? config.get('framework');
}
