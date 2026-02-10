import { http, HttpResponse } from 'msw';
import { mkdir, realpath, writeFile } from 'node:fs/promises';
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

import { handlers } from '../../tests/mocks/handlers';
import { server } from '../../tests/mocks/node';
import { textHistory } from '../../tests/mocks/spinner';

import { consola } from './lib/logger';
import { mkTempDir } from './lib/mk-temp-dir';
import { program } from './program';

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../tests/mocks/spinner'));

const { mockIdentify } = vi.hoisted(() => ({
  mockIdentify: vi.fn(),
}));

vi.mock('./lib/telemetry', () => ({
  Telemetry: vi.fn().mockImplementation(() => ({
    identify: mockIdentify,
    isEnabled: vi.fn(() => true),
    track: vi.fn(),
    analytics: { closeAndFlush: vi.fn() },
  })),
}));

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;

const projectUuidFromFlag = '11111111-fd99-4a94-9fb3-945551623923';
const projectUuidFromEnv = '22222222-fd99-4a94-9fb3-945551623924';
const projectUuidFromProjectJson = 'a23f5785-fd99-4a94-9fb3-945551623923';

const storeHashFromFlag = 'store-hash-flag';
const storeHashFromEnv = 'store-hash-env';
const storeHashFromProjectJson = 'store-hash-json';

const accessTokenFromFlag = 'access-token-flag';
const accessTokenFromEnv = 'access-token-env';
const accessTokenFromProjectJson = 'access-token-json';

const deploymentResponse = () =>
  HttpResponse.json({
    data: { deployment_uuid: '5b29c3c0-5f68-44fe-99e5-06492babf7be' },
  });

async function writeProjectJson(overrides: {
  projectUuid?: string;
  storeHash?: string;
  accessToken?: string;
}) {
  const path = join(tmpDir, '.bigcommerce', 'project.json');

  await mkdir(dirname(path), { recursive: true });

  const defaults = {
    projectUuid: projectUuidFromProjectJson,
    framework: 'catalyst' as const,
    storeHash: storeHashFromProjectJson,
    accessToken: accessTokenFromProjectJson,
    telemetry: { enabled: true, anonymousId: 'test-id' },
  };

  await writeFile(path, JSON.stringify({ ...defaults, ...overrides }));
}

function useCaptureHandlers(captured: {
  storeHash: string;
  projectUuid: string;
  accessToken: string;
}) {
  server.use(
    http.post(
      'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments/uploads',
      ({ request, params }) => {
        captured.storeHash = params.storeHash as string;
        captured.accessToken =
          request.headers.get('X-Auth-Token') ?? request.headers.get('x-auth-token') ?? '';

        return HttpResponse.json({
          data: {
            upload_url: 'https://mock-upload-url.com',
            upload_uuid: '0e93ce5f-6f91-4236-87ec-ca79627f31ba',
          },
        });
      },
    ),
  );
  server.use(
    http.post(
      'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments',
      async ({ request, params }) => {
        captured.storeHash =
          (params.storeHash as string) || new URL(request.url).pathname.split('/')[2] || '';

        const body = (await request.json()) as { project_uuid?: string };

        captured.projectUuid = body.project_uuid ?? '';
        captured.accessToken =
          request.headers.get('X-Auth-Token') ?? request.headers.get('x-auth-token') ?? '';

        return deploymentResponse();
      },
    ),
  );
}

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();
  tmpDir = await realpath(tmpDir);

  // Minimal dist so deploy's generateBundleZip() passes; we only assert on config → request values.
  const distDir = join(tmpDir, '.bigcommerce', 'dist');

  await mkdir(distDir, { recursive: true });
  await writeFile(join(distDir, 'worker.js'), '');
  await mkdir(join(distDir, 'assets'), { recursive: true });
  await writeFile(join(distDir, 'assets', 'placeholder'), '');
});

beforeEach(() => {
  process.chdir(tmpDir);
  vi.clearAllMocks();
  textHistory.length = 0;
  server.resetHandlers();
  server.use(...handlers);
});

afterEach(() => {
  delete process.env.CATALYST_PROJECT_UUID;
  delete process.env.CATALYST_STORE_HASH;
  delete process.env.CATALYST_ACCESS_TOKEN;
});

afterAll(async () => {
  server.resetHandlers();
  server.use(...handlers);
  exitMock.mockRestore();
  await cleanup();
});

describe('config resolution priority', () => {
  describe('projectUuid', () => {
    test('explicit flag overrides env and project.json', async () => {
      await writeProjectJson({ projectUuid: projectUuidFromProjectJson });
      process.env.CATALYST_PROJECT_UUID = projectUuidFromEnv;

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync([
        'node',
        'catalyst',
        'deploy',
        '--store-hash',
        storeHashFromFlag,
        '--access-token',
        accessTokenFromFlag,
        '--project-uuid',
        projectUuidFromFlag,
      ]);

      expect(captured.projectUuid).toBe(projectUuidFromFlag);
    });

    test('environment variable overrides project.json when no flag', async () => {
      await writeProjectJson({ projectUuid: projectUuidFromProjectJson });
      process.env.CATALYST_PROJECT_UUID = projectUuidFromEnv;

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync(['node', 'catalyst', 'deploy']);

      expect(captured.projectUuid).toBe(projectUuidFromEnv);
    });

    test('project.json used when no flag or env', async () => {
      await writeProjectJson({
        projectUuid: projectUuidFromProjectJson,
        storeHash: storeHashFromProjectJson,
        accessToken: accessTokenFromProjectJson,
      });

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync(['node', 'catalyst', 'deploy']);

      expect(captured.projectUuid).toBe(projectUuidFromProjectJson);
    });
  });

  describe('storeHash', () => {
    test('explicit flag overrides env and project.json', async () => {
      await writeProjectJson({ storeHash: storeHashFromProjectJson });
      process.env.CATALYST_STORE_HASH = storeHashFromEnv;

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync([
        'node',
        'catalyst',
        'deploy',
        '--store-hash',
        storeHashFromFlag,
        '--access-token',
        accessTokenFromFlag,
        '--project-uuid',
        projectUuidFromFlag,
      ]);

      expect(captured.storeHash).toBe(storeHashFromFlag);
    });

    test('environment variable overrides project.json when no flag', async () => {
      await writeProjectJson({
        storeHash: storeHashFromProjectJson,
        accessToken: accessTokenFromProjectJson,
        projectUuid: projectUuidFromProjectJson,
      });
      process.env.CATALYST_STORE_HASH = storeHashFromEnv;
      process.env.CATALYST_PROJECT_UUID = projectUuidFromEnv;

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync(['node', 'catalyst', 'deploy']);

      expect(captured.storeHash).toBe(storeHashFromEnv);
    });

    test('project.json used when no flag or env', async () => {
      await writeProjectJson({
        projectUuid: projectUuidFromProjectJson,
        storeHash: storeHashFromProjectJson,
        accessToken: accessTokenFromProjectJson,
      });

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync(['node', 'catalyst', 'deploy']);

      expect(captured.storeHash).toBe(storeHashFromProjectJson);
    });
  });

  describe('accessToken', () => {
    test('explicit flag overrides env and project.json', async () => {
      await writeProjectJson({ accessToken: accessTokenFromProjectJson });
      process.env.CATALYST_STORE_HASH = storeHashFromEnv;
      process.env.CATALYST_ACCESS_TOKEN = accessTokenFromEnv;
      process.env.CATALYST_PROJECT_UUID = projectUuidFromEnv;

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync([
        'node',
        'catalyst',
        'deploy',
        '--store-hash',
        storeHashFromFlag,
        '--access-token',
        accessTokenFromFlag,
        '--project-uuid',
        projectUuidFromFlag,
      ]);

      expect(captured.accessToken).toBe(accessTokenFromFlag);
    });

    test('environment variable overrides project.json when no flag', async () => {
      await writeProjectJson({
        storeHash: storeHashFromProjectJson,
        accessToken: accessTokenFromProjectJson,
        projectUuid: projectUuidFromProjectJson,
      });
      process.env.CATALYST_STORE_HASH = storeHashFromEnv;
      process.env.CATALYST_ACCESS_TOKEN = accessTokenFromEnv;
      process.env.CATALYST_PROJECT_UUID = projectUuidFromEnv;

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync(['node', 'catalyst', 'deploy']);

      expect(captured.accessToken).toBe(accessTokenFromEnv);
    });

    test('project.json used when no flag or env', async () => {
      await writeProjectJson({
        projectUuid: projectUuidFromProjectJson,
        storeHash: storeHashFromProjectJson,
        accessToken: accessTokenFromProjectJson,
      });

      const captured = { storeHash: '', projectUuid: '', accessToken: '' };

      useCaptureHandlers(captured);

      await program.parseAsync(['node', 'catalyst', 'deploy']);

      expect(captured.accessToken).toBe(accessTokenFromProjectJson);
    });
  });
});
