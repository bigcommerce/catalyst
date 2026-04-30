import { colorize } from 'consola/utils';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';
import { z } from 'zod';

const CATALYST_CLI_VERSION = '1.0.0-alpha.3';
const OPENNEXT_CLOUDFLARE_VERSION = '1.17.3';

const corePackageJsonSchema = z
  .object({
    scripts: z.record(z.string(), z.string()).optional(),
    dependencies: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

const writeJson = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

const symlinkRootEnvToCore = (projectDir: string) => {
  const coreEnvPath = join(projectDir, 'core', '.env.local');

  // Don't clobber an existing file or symlink at core/.env.local
  if (lstatSync(coreEnvPath, { throwIfNoEntry: false })) return;

  try {
    symlinkSync('../.env.local', coreEnvPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    console.warn(
      colorize(
        'yellow',
        `\nCould not create symlink at core/.env.local: ${message}\nOn Windows, enable Developer Mode or run as administrator to allow symlinks.\nYou will need to keep .env.local and core/.env.local in sync manually.\n`,
      ),
    );
  }
};

const convertProxyToMiddleware = (projectDir: string) => {
  const proxyPath = join(projectDir, 'core', 'proxy.ts');
  const middlewarePath = join(projectDir, 'core', 'middleware.ts');

  if (!existsSync(proxyPath)) return;

  const contents = readFileSync(proxyPath, 'utf-8')
    .replace('export const proxy', 'export const middleware')
    .replace('export const config = {', "export const config = {\n  runtime: 'experimental-edge',");

  writeFileSync(middlewarePath, contents);
  unlinkSync(proxyPath);
};

export const setupCommerceHosting = ({
  projectDir,
  projectUuid,
  storeHash,
  accessToken,
}: {
  projectDir: string;
  projectUuid: string;
  storeHash?: string;
  accessToken?: string;
}) => {
  const corePackageJsonPath = join(projectDir, 'core', 'package.json');
  const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(corePackageJsonPath, 'utf-8')));

  pkg.scripts = {
    ...pkg.scripts,
    build: 'npm run generate && catalyst build',
    deploy: 'catalyst deploy',
  };

  pkg.dependencies = {
    ...pkg.dependencies,
    '@bigcommerce/catalyst': CATALYST_CLI_VERSION,
    '@opennextjs/cloudflare': OPENNEXT_CLOUDFLARE_VERSION,
  };

  writeJson(corePackageJsonPath, pkg);

  const projectJson: Record<string, string> = {
    projectUuid,
    framework: 'catalyst',
  };

  if (storeHash) projectJson.storeHash = storeHash;
  if (accessToken) projectJson.accessToken = accessToken;

  writeJson(join(projectDir, 'core', '.bigcommerce', 'project.json'), projectJson);

  symlinkRootEnvToCore(projectDir);
  convertProxyToMiddleware(projectDir);
};
