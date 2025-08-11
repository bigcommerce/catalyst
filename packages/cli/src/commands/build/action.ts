import { ConsolaInstance, createConsola, LogLevels } from 'consola';
import { execa as _execa, Options as ExecaOptions } from 'execa';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getProjectConfig } from '../../lib/project-config';

import { opennextBuild } from './opennext-build';

import { type Options as BuildCommandOptions } from './index';

type Logger = Pick<ConsolaInstance, 'debug' | 'start' | 'success' | 'fail' | 'info' | 'error'>;
type Config = () => {
  get: (key: 'framework') => 'catalyst' | 'nextjs';
  path: string;
};
export type Exec = (
  command: string,
  args?: string[],
  options?: ExecaOptions,
) => PromiseLike<unknown>;

export function resolveFramework(options: BuildCommandOptions, getConfig: Config, logger: Logger) {
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

export function createLogger(options: BuildCommandOptions) {
  return createConsola({ level: options.verbose ? LogLevels.verbose : LogLevels.info });
}

export function createExec(options: BuildCommandOptions, exec: Exec = _execa) {
  return (command: string, args?: string[], execaOptions?: ExecaOptions) => {
    return exec(command, args, {
      stdout: options.verbose ? 'inherit' : 'ignore',
      stderr: options.verbose ? 'inherit' : 'ignore',
      cwd: process.cwd(),
      ...execaOptions,
      env: {
        ...process.env,
      },
    });
  };
}

export async function generateGqlTadaTypes(
  exec: Exec,
  resolveBinary: (bin: string) => string = resolveLocalBinaryPath,
) {
  const dotenvBin = resolveBinary('dotenv');

  await exec(dotenvBin, ['-e', '.env.local', '--', 'node', './scripts/generate.cjs']);
}

export async function buildNextjs(
  exec: Exec,
  resolveBinary: (bin: string) => string = resolveLocalBinaryPath,
) {
  const nextBin = resolveBinary('next');

  await exec(nextBin, ['build']);
}

export function resolveLocalBinaryPath(
  bin: string,
  cwd: string = process.cwd(),
  exists: (p: string) => boolean = existsSync,
) {
  const binPath = join(cwd, 'node_modules', '.bin', bin);

  if (!exists(binPath)) {
    throw new Error(
      `${bin} not found in ${cwd}. Check that you are in a valid Catalyst project directory.`,
    );
  }

  return binPath;
}

export const action = async (options: BuildCommandOptions) => {
  const logger = createLogger(options);
  const exec = createExec(options);

  const framework = resolveFramework(options, getProjectConfig, logger);

  logger.info(`Building application with framework: ${framework}`);

  if (framework === 'nextjs') {
    logger.start('Generating gql.tada types...');
    await generateGqlTadaTypes(exec);
    logger.success('gql.tada types generated successfully');

    logger.start('Building application with `next build`...');
    await buildNextjs(exec);
    logger.success('Application built successfully');
  }

  if (framework === 'catalyst') {
    logger.info(`Building with Catalyst...`);

    logger.start('Building application with `opennext build`...');
    await opennextBuild();
    logger.success('Application built successfully');
  }
};
