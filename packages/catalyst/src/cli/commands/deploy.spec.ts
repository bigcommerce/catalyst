import { Command } from 'commander';
import { Effect } from 'effect';
import { mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  MockInstance,
  test,
  vi,
} from 'vitest';

import { textHistory } from '../../../tests/mocks/spinner';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig } from '../lib/project-config';
import { program } from '../program';

import { buildCatalystProject } from './build';
import {
  deploy,
  parseEnvironmentVariables,
} from './deploy';

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));
vi.mock('./build', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./build')>();

  return { ...actual, buildCatalystProject: vi.fn(() => Effect.void) };
});

let exitMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;

const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  // Normalize to /private/var to avoid /var vs /private/var mismatches
  tmpDir = await realpath(tmpDir);

  const workerPath = join(tmpDir, '.bigcommerce', 'dist', 'worker.js');
  const assetsDir = join(tmpDir, '.bigcommerce', 'dist', 'assets');

  await mkdir(dirname(workerPath), { recursive: true });
  await writeFile(workerPath, 'console.log("worker");');
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(assetsDir, 'test.txt'), 'asset file');
});

beforeEach(() => {
  process.chdir(tmpDir);
  vi.spyOn(consola, 'prompt').mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();

  // Resets spinner text history
  textHistory.length = 0;
});

afterAll(async () => {
  await cleanup();
});

test('properly configured Command instance', () => {
  expect(deploy).toBeInstanceOf(Command);
  expect(deploy.name()).toBe('deploy');
  expect(deploy.description()).toBe('Deploy your application to Cloudflare.');
  expect(deploy.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ flags: '--store-hash <hash>' }),
      expect.objectContaining({ flags: '--access-token <token>' }),
      expect.objectContaining({ flags: '--api-host <host>', defaultValue: 'api.bigcommerce.com' }),
      expect.objectContaining({ flags: '--project-uuid <uuid>' }),
      expect.objectContaining({ flags: '--secret <value>' }),
      expect.objectContaining({ flags: '--dry-run' }),
      expect.objectContaining({ flags: '--prebuilt' }),
    ]),
  );
});

test('--dry-run skips upload and deployment', async () => {
  await program.parseAsync([
    'node',
    'catalyst',
    'deploy',
    '--store-hash',
    storeHash,
    '--access-token',
    accessToken,
    '--api-host',
    apiHost,
    '--project-uuid',
    projectUuid,
    '--dry-run',
  ]);

  expect(consola.info).toHaveBeenCalledWith('Generating bundle...');
  expect(consola.success).toHaveBeenCalledWith('Bundle created.');
  expect(consola.info).toHaveBeenCalledWith(
    'Dry run enabled — skipping upload and deployment steps.',
  );
  expect(consola.info).toHaveBeenCalledWith('Next steps (skipped):');
  expect(consola.info).toHaveBeenCalledWith('- Generate upload signature');
  expect(consola.info).toHaveBeenCalledWith('- Upload bundle.zip');
  expect(consola.info).toHaveBeenCalledWith('- Create deployment');
  expect(exitMock).toHaveBeenCalledWith(0);
});

test('--dry-run uses storeHash and accessToken from .bigcommerce/project.json when not provided', async () => {
  const config = getProjectConfig();

  config.set('projectUuid', projectUuid);
  config.set('storeHash', storeHash);
  config.set('accessToken', accessToken);

  await program.parseAsync(['node', 'catalyst', 'deploy', '--dry-run']);

  expect(consola.info).toHaveBeenCalledWith('Generating bundle...');
  expect(consola.success).toHaveBeenCalledWith('Bundle created.');
  expect(exitMock).toHaveBeenCalledWith(0);
});

test('errors when store hash is missing and not in .bigcommerce/project.json', async () => {
  const config = getProjectConfig();

  config.set('projectUuid', projectUuid);
  config.set('accessToken', accessToken);
  config.delete('storeHash');

  vi.stubEnv('CATALYST_STORE_HASH', undefined);

  await expect(program.parseAsync(['node', 'catalyst', 'deploy'])).rejects.toThrow(
    'Missing credentials',
  );

  expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
  expect(exitMock).toHaveBeenCalledWith(1);

  vi.unstubAllEnvs();
});

test('errors when access token is missing and not in .bigcommerce/project.json', async () => {
  const config = getProjectConfig();

  config.set('projectUuid', projectUuid);
  config.set('storeHash', storeHash);
  config.delete('accessToken');

  vi.stubEnv('CATALYST_ACCESS_TOKEN', undefined);

  await expect(program.parseAsync(['node', 'catalyst', 'deploy'])).rejects.toThrow(
    'Missing credentials',
  );

  expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
  expect(exitMock).toHaveBeenCalledWith(1);

  vi.unstubAllEnvs();
});

test('reads from env options', () => {
  const envVariables = parseEnvironmentVariables([
    'BIGCOMMERCE_STORE_HASH=123',
    'BIGCOMMERCE_STOREFRONT_TOKEN=456',
  ]);

  expect(envVariables).toEqual([
    {
      type: 'secret',
      key: 'BIGCOMMERCE_STORE_HASH',
      value: '123',
    },
    {
      type: 'secret',
      key: 'BIGCOMMERCE_STOREFRONT_TOKEN',
      value: '456',
    },
  ]);

  expect(() => parseEnvironmentVariables(['foo_bar'])).toThrow(
    'Invalid secret format: foo_bar. Expected format: KEY=VALUE',
  );
});

describe('--prebuilt flag', () => {
  test('skips build step when --prebuilt is passed', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'deploy',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--api-host',
      apiHost,
      '--project-uuid',
      projectUuid,
      '--prebuilt',
      '--dry-run',
    ]);

    expect(buildCatalystProject).not.toHaveBeenCalled();
    expect(consola.info).toHaveBeenCalledWith('Using existing build output (--prebuilt).');
    expect(consola.info).toHaveBeenCalledWith('Generating bundle...');
  });

  test('fails when dist directory is missing', async () => {
    const [missingDistDir, missingDistCleanup] = await mkTempDir();
    const resolvedDir = await realpath(missingDistDir);

    process.chdir(resolvedDir);

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'deploy',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--api-host',
        apiHost,
        '--project-uuid',
        projectUuid,
        '--prebuilt',
      ]),
    ).rejects.toThrow(
      'No build output found at .bigcommerce/dist/. Run `catalyst build` first or remove `--prebuilt` to build automatically.',
    );

    process.chdir(tmpDir);
    await missingDistCleanup();
  });

  test('fails when dist directory is empty', async () => {
    const [emptyDistDir, emptyDistCleanup] = await mkTempDir();
    const resolvedDir = await realpath(emptyDistDir);

    await mkdir(join(resolvedDir, '.bigcommerce', 'dist'), { recursive: true });

    process.chdir(resolvedDir);

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'deploy',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--api-host',
        apiHost,
        '--project-uuid',
        projectUuid,
        '--prebuilt',
      ]),
    ).rejects.toThrow(
      'No build output found at .bigcommerce/dist/. Run `catalyst build` first or remove `--prebuilt` to build automatically.',
    );

    process.chdir(tmpDir);
    await rm(join(resolvedDir, '.bigcommerce'), { recursive: true });
    await emptyDistCleanup();
  });
});
