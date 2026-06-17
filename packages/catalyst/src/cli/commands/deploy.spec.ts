import { confirm, input, select } from '@inquirer/prompts';
import AdmZip from 'adm-zip';
import { Command } from 'commander';
import { http, HttpResponse } from 'msw';
import { mkdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
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

import { server } from '../../../tests/mocks/node';
import { textHistory } from '../../../tests/mocks/spinner';
import { setupCommerceHosting } from '../lib/commerce-hosting';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig } from '../lib/project-config';
import { getProjectState } from '../lib/project-state';
import { program } from '../program';

import { buildCatalystProject } from './build';
import {
  createDeployment,
  deploy,
  generateBundleZip,
  generateUploadSignature,
  getDeploymentStatus,
  parseEnvironmentVariables,
  uploadBundleZip,
} from './deploy';

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  input: vi.fn(),
  select: vi.fn(),
}));

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));
vi.mock('./build', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./build')>();

  return { ...actual, buildCatalystProject: vi.fn() };
});

// Default to a transformed project so the deploy flow's transformation guard
// is a no-op for tests that don't care about it. Tests that exercise the
// guard override this per-case via `vi.mocked(getProjectState).mockReturnValueOnce(...)`.
vi.mock('../lib/project-state', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/project-state')>();

  return {
    ...actual,
    getProjectState: vi.fn(() => ({
      projectUuid: 'mock-uuid',
      hasMiddleware: true,
      hasProxy: false,
      hasOpenNextDep: true,
      isLinked: true,
      isTransformed: true,
      isFullySetUp: true,
    })),
  };
});

vi.mock('../lib/commerce-hosting', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/commerce-hosting')>();

  return { ...actual, setupCommerceHosting: vi.fn() };
});

vi.mock('../lib/install-dependencies', () => ({
  installDependencies: vi.fn(),
}));

let exitMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;
let outputZip: string;

const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const uploadUuid = '0e93ce5f-6f91-4236-87ec-ca79627f31ba';
const uploadUrl = 'https://mock-upload-url.com';
const deploymentUuid = '5b29c3c0-5f68-44fe-99e5-06492babf7be';

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  // Normalize to /private/var to avoid /var vs /private/var mismatches
  tmpDir = await realpath(tmpDir);

  const workerPath = join(tmpDir, '.bigcommerce', 'dist', 'worker.js');
  const assetsDir = join(tmpDir, '.bigcommerce', 'dist', 'assets');

  outputZip = join(tmpDir, '.bigcommerce', 'bundle.zip');

  await mkdir(dirname(workerPath), { recursive: true });
  await writeFile(workerPath, 'console.log("worker");');
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(assetsDir, 'test.txt'), 'asset file');
});

beforeEach(() => {
  process.chdir(tmpDir);
  // Default the transformation-guard confirm to "yes" so tests that don't
  // exercise it proceed past the guard.
  vi.mocked(confirm).mockResolvedValue(true);
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

describe('bundle zip generation and upload', () => {
  test('creates bundle.zip from build output', async () => {
    await generateBundleZip();

    // Check file exists
    const stats = await stat(outputZip);

    expect(stats.size).toBeGreaterThan(0);

    expect(consola.info).toHaveBeenCalledWith('Generating bundle...');
    expect(consola.success).toHaveBeenCalledWith(`Bundle created at: ${outputZip}`);
  });

  test('zip contains output folder with assets and worker.js', async () => {
    await generateBundleZip();

    // Check file exists
    const stats = await stat(outputZip);

    expect(stats.size).toBeGreaterThan(0);

    const zip = new AdmZip(outputZip);
    const entries = zip.getEntries().map((e) => e.entryName);

    // Check for output/ folder
    expect(entries.every((e) => e.startsWith('output/'))).toBe(true);
    // Check for output/assets/ directory
    expect(entries.some((e) => e.startsWith('output/assets/'))).toBe(true);
    // Check for output/worker.js
    expect(entries).toContain('output/worker.js');

    expect(consola.success).toHaveBeenCalledWith(`Bundle created at: ${outputZip}`);
  });

  test('fetches upload signature', async () => {
    const signature = await generateUploadSignature(storeHash, accessToken, apiHost);

    expect(consola.info).toHaveBeenCalledWith('Generating upload signature...');
    expect(consola.success).toHaveBeenCalledWith('Upload signature generated.');

    expect(signature.upload_url).toBe(uploadUrl);
    expect(signature.upload_uuid).toBe(uploadUuid);
  });

  test('fetches upload signature and uploads bundle zip', async () => {
    const uploadResult = await uploadBundleZip(uploadUrl);

    expect(consola.info).toHaveBeenCalledWith('Uploading bundle...');
    expect(consola.success).toHaveBeenCalledWith('Bundle uploaded successfully.');

    expect(uploadResult).toBe(true);
  });
});

describe('deployment and event streaming', () => {
  test('creates a deployment', async () => {
    const deployment = await createDeployment(
      projectUuid,
      uploadUuid,
      storeHash,
      accessToken,
      apiHost,
    );

    expect(deployment.deployment_uuid).toBe(deploymentUuid);
  });

  test('streams deployment status until completion', async () => {
    await getDeploymentStatus(deploymentUuid, storeHash, accessToken, apiHost);

    expect(consola.info).toHaveBeenCalledWith('Fetching deployment status...');

    expect(textHistory).toEqual([
      'Fetching...',
      'Processing...',
      'Finalizing...',
      'Deployment completed successfully.',
    ]);
  });

  test('warns if event stream is incomplete or unable to be parsed', async () => {
    const encoder = new TextEncoder();

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments/:deploymentUuid/events',
        () => {
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  `data: {"deployment_status":"in_progress","deployment_uuid":"${deploymentUuid}","event":{"step":"processing","progress":75}}`,
                ),
              );
              setTimeout(() => {
                // Incomplete stream data
                controller.enqueue(encoder.encode(`data: {"deployment_status":"in_progress",`));
              }, 10);
              setTimeout(() => {
                controller.enqueue(
                  encoder.encode(
                    `data: {"deployment_status":"in_progress","deployment_uuid":"${deploymentUuid}","event":{"step":"finalizing","progress":99}}`,
                  ),
                );
                controller.close();
              }, 20);
            },
          });

          return new HttpResponse(stream, {
            status: 200,
            headers: { 'Content-Type': 'text/event-stream' },
          });
        },
      ),
    );

    await getDeploymentStatus(deploymentUuid, storeHash, accessToken, apiHost);

    expect(consola.info).toHaveBeenCalledWith('Fetching deployment status...');

    expect(textHistory).toEqual([
      'Fetching...',
      'Processing...',
      'Finalizing...',
      'Deployment completed successfully.',
    ]);

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse event, dropping from stream.'),
      expect.any(Error),
    );
  });

  test('handles deployment errors', async () => {
    const encoder = new TextEncoder();

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments/:deploymentUuid/events',
        () => {
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  `data: {"deployment_status":"in_progress","deployment_uuid":"${deploymentUuid}","event":{"step":"processing","progress":75}}`,
                ),
              );
              setTimeout(() => {
                controller.enqueue(
                  encoder.encode(
                    `data: {"deployment_status":"in_progress","deployment_uuid":"${deploymentUuid}","event":{"step":"unzipping","progress":99},"error":{"code":30}}`,
                  ),
                );
              }, 10);
            },
          });

          return new HttpResponse(stream, {
            status: 200,
            headers: { 'Content-Type': 'text/event-stream' },
          });
        },
      ),
    );

    await expect(
      getDeploymentStatus(deploymentUuid, storeHash, accessToken, apiHost),
    ).rejects.toThrow(
      'Deployment failed (error code 30): Your bundle could not be extracted. This may mean your build output is too large (max 64 MB compressed / 512 MB uncompressed) or the archive is corrupted. Try reducing your build size or rebuilding your project and deploying again.',
    );

    expect(consola.info).toHaveBeenCalledWith('Fetching deployment status...');

    expect(textHistory).toEqual(['Fetching...', 'Processing...']);
  });
});

describe('linked project verification', () => {
  test('proceeds when the linked project still exists on the server', async () => {
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

    expect(consola.info).not.toHaveBeenCalledWith('No project is currently linked.');
    expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining('no longer exists'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('prompts for a new project when the linked uuid no longer exists', async () => {
    const config = getProjectConfig();
    const staleUuid = '00000000-0000-0000-0000-000000000000';

    config.set('projectUuid', staleUuid);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    // The project picker is a select that returns the chosen project UUID.
    vi.mocked(select).mockResolvedValue(projectUuid);

    await program.parseAsync(['node', 'catalyst', 'deploy', '--dry-run']);

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining(`The linked project (${staleUuid}) no longer exists`),
    );
    expect(consola.success).toHaveBeenCalledWith('Linked project "Project One".');
    expect(config.get('projectUuid')).toBe(projectUuid);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('prompts for a project when none is linked yet', async () => {
    const config = getProjectConfig();

    config.delete('projectUuid');
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    // The project picker is a select that returns the chosen project UUID.
    vi.mocked(select).mockResolvedValue(projectUuid);

    await program.parseAsync(['node', 'catalyst', 'deploy', '--dry-run']);

    expect(consola.info).toHaveBeenCalledWith('No project is currently linked.');
    expect(consola.success).toHaveBeenCalledWith('Linked project "Project One".');
    expect(config.get('projectUuid')).toBe(projectUuid);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('offers to create when no projects exist on the store', async () => {
    const config = getProjectConfig();

    config.delete('projectUuid');
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    // No projects exist → a confirm ("create one?") then an input (project name).
    // The transformation-guard confirm defaults to true via beforeEach.
    vi.mocked(input).mockResolvedValue('My New Project');

    await program.parseAsync(['node', 'catalyst', 'deploy', '--dry-run']);

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: expect.stringContaining(
          'There are not any hosting projects that you can link to yet',
        ),
      }),
    );
    expect(input).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Enter a name for the new project:' }),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('exits gracefully with guidance when user declines to create', async () => {
    const config = getProjectConfig();

    config.delete('projectUuid');
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    // Declining the "create one?" confirm throws NoLinkedProjectError.
    vi.mocked(confirm).mockResolvedValue(false);

    await expect(program.parseAsync(['node', 'catalyst', 'deploy', '--dry-run'])).rejects.toThrow(
      'No infrastructure project linked',
    );

    expect(consola.info).toHaveBeenCalledWith(
      "When you're ready to create a project, run `catalyst project create` or re-run `catalyst deploy`.",
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });
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
  expect(consola.success).toHaveBeenCalledWith(`Bundle created at: ${outputZip}`);
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
  expect(consola.success).toHaveBeenCalledWith(`Bundle created at: ${outputZip}`);
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
    'Invalid env var format: foo_bar. Expected format: KEY=VALUE',
  );
});

test('splits secrets on the first = so values containing = survive', () => {
  const envVariables = parseEnvironmentVariables(['TOKEN=abc=def==']);

  expect(envVariables).toEqual([{ type: 'secret', key: 'TOKEN', value: 'abc=def==' }]);
});

describe('persisted env vars', () => {
  interface DeploymentBody {
    environment_variables?: Array<{ type: string; key: string; value: string }>;
  }

  test('sends stored env vars and lets inline --secret override the same key', async () => {
    const config = getProjectConfig();

    config.set('projectUuid', projectUuid);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);
    config.set('env', { PERSISTED_ONLY: 'keep', SHARED: 'stored' });

    let body: DeploymentBody | undefined;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments',
        async ({ request }) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          body = (await request.json()) as DeploymentBody;

          return HttpResponse.json({ data: { deployment_uuid: deploymentUuid } });
        },
      ),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'deploy',
      '--api-host',
      apiHost,
      '--prebuilt',
      '--secret',
      'SHARED=override',
      '--secret',
      'FLAG_ONLY=flag',
    ]);

    expect(body?.environment_variables).toEqual(
      expect.arrayContaining([
        { type: 'secret', key: 'PERSISTED_ONLY', value: 'keep' },
        { type: 'secret', key: 'SHARED', value: 'override' },
        { type: 'secret', key: 'FLAG_ONLY', value: 'flag' },
      ]),
    );
    // The shared key is sent once, with the inline flag value winning.
    expect(body?.environment_variables?.filter((e) => e.key === 'SHARED')).toHaveLength(1);

    config.delete('env');
  });

  test('omits environment_variables when nothing is stored or passed', async () => {
    const config = getProjectConfig();

    config.set('projectUuid', projectUuid);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);
    config.delete('env');

    let body: DeploymentBody | undefined;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments',
        async ({ request }) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          body = (await request.json()) as DeploymentBody;

          return HttpResponse.json({ data: { deployment_uuid: deploymentUuid } });
        },
      ),
    );

    await program.parseAsync(['node', 'catalyst', 'deploy', '--api-host', apiHost, '--prebuilt']);

    expect(body?.environment_variables).toBeUndefined();
  });
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

describe('transformation guard', () => {
  const untransformedState = {
    projectUuid: undefined,
    hasMiddleware: false,
    hasProxy: true,
    hasOpenNextDep: false,
    isLinked: false,
    isTransformed: false,
    isFullySetUp: false,
  };

  test('runs setupCommerceHosting + installDependencies when project is not transformed', async () => {
    vi.mocked(getProjectState).mockReturnValueOnce(untransformedState);

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

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: expect.stringContaining('not yet set up for Commerce Hosting deployments'),
      }),
    );
    expect(setupCommerceHosting).toHaveBeenCalledWith({
      projectDir: dirname(tmpDir),
      projectUuid,
      storeHash,
      accessToken,
    });
    expect(installDependencies).toHaveBeenCalledWith(dirname(tmpDir));
  });

  test('exits gracefully when user declines to run setup', async () => {
    vi.mocked(getProjectState).mockReturnValueOnce(untransformedState);
    vi.mocked(confirm).mockResolvedValueOnce(false);

    // In production, process.exit halts. In tests it's mocked, so we can only
    // verify the user-visible signals: the guidance log and the exit code.
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

    expect(consola.info).toHaveBeenCalledWith(
      "When you're ready to deploy, re-run `catalyst deploy` to complete setup.",
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('skips setup when project is already transformed', async () => {
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

    expect(setupCommerceHosting).not.toHaveBeenCalled();
    expect(installDependencies).not.toHaveBeenCalled();
  });
});

describe('--update-site-url', () => {
  function deployArgs(extra: string[] = []) {
    return [
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
      ...extra,
    ];
  }

  test('triggers the interactive flow and PUTs the chosen hostname after deploy', async () => {
    let putBody: unknown;
    let putChannelId: string | undefined;

    server.use(
      http.put(
        'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site',
        async ({ request, params }) => {
          putBody = await request.json();
          putChannelId = String(params.channelId);

          return HttpResponse.json({
            data: {
              id: 1,
              url: 'https://project-one.catalyst-sandbox.store',
              channel_id: 2,
            },
          });
        },
      ),
    );

    // The interactive flow asks two selects in order: the channel (returns the
    // numeric channel id) then the hostname (returns the hostname string).
    vi.mocked(select)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await program.parseAsync(deployArgs(['--update-site-url']));

    expect(putChannelId).toBe('2');
    expect(putBody).toEqual({ url: 'https://project-one.catalyst-sandbox.store' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel "Catalyst Storefront" (2) site URL'),
    );
  });

  test('places the freshly-deployed hostname first in the hostname prompt', async () => {
    let hostnameChoices: Array<{ name: string; value: string }> | undefined;

    // Project Two has no hostnames by default; use Project One whose handler
    // already returns the two seeded hostnames. Inject the freshly-deployed
    // hostname into Project One's list so preferHostname has something to match.
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({
          data: [
            {
              uuid: projectUuid,
              name: 'Project One',
              deployment_hostnames: [
                'project-one.catalyst-sandbox.store',
                'example.com', // the just-deployed hostname (per the SSE default)
              ],
            },
          ],
        }),
      ),
    );

    vi.mocked(select)
      .mockResolvedValueOnce(2) // channel
      .mockImplementationOnce((config) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const cfg = config as unknown as { choices: Array<{ name: string; value: string }> };

        hostnameChoices = cfg.choices;

        return Object.assign(Promise.resolve('example.com'), { cancel: () => undefined });
      });

    await program.parseAsync(deployArgs(['--update-site-url']));

    expect(hostnameChoices?.[0]).toMatchObject({ value: 'example.com' });
  });

  test('does not call the channel site API when the flag is omitted', async () => {
    let putCalled = false;

    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () => {
        putCalled = true;

        return HttpResponse.json({}, { status: 200 });
      }),
    );

    await program.parseAsync(deployArgs());

    expect(putCalled).toBe(false);
    expect(consola.success).not.toHaveBeenCalledWith(expect.stringContaining('Updated channel'));
  });

  test('soft-fails with a warning when the update API returns an error', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 401 }),
      ),
    );

    vi.mocked(select)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await program.parseAsync(deployArgs(['--update-site-url']));

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to update channel site URL'),
    );
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('catalyst auth login'));
  });
});
