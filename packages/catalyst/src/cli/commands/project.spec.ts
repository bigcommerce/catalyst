import { NodeContext } from '@effect/platform-node';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { Effect, Layer } from 'effect';

import { server } from '../../../tests/mocks/node';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { LiveLayer } from '../layers';
import { cli } from './root';

let exitMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const { mockIdentify } = vi.hoisted(() => ({
  mockIdentify: vi.fn().mockResolvedValue(undefined),
}));

const projectUuid1 = 'a23f5785-fd99-4a94-9fb3-945551623923';
const projectUuid2 = 'b23f5785-fd99-4a94-9fb3-945551623924';
const projectUuid3 = 'c23f5785-fd99-4a94-9fb3-945551623925';
const storeHash = 'test-store';
const accessToken = 'test-token';

const AppLayer = Layer.mergeAll(LiveLayer, NodeContext.layer);

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());

  vi.mock('../lib/telemetry', () => {
    const instance = {
      identify: mockIdentify,
      isEnabled: vi.fn(() => true),
      track: vi.fn().mockResolvedValue(undefined),
      sessionId: 'test-session-uuid',
      commandName: 'unknown',
      durationMs: vi.fn().mockReturnValue(0),
      analytics: {
        closeAndFlush: vi.fn().mockResolvedValue(undefined),
      },
    };

    return {
      Telemetry: vi.fn().mockImplementation(() => instance),
      getTelemetry: vi.fn(() => instance),
      resetTelemetry: vi.fn(),
    };
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);

  config = getProjectConfig();
});

afterEach(() => {
  vi.clearAllMocks();
  config.delete('storeHash');
  config.delete('accessToken');
  config.delete('projectUuid');
});

afterAll(async () => {
  vi.restoreAllMocks();
  exitMock.mockRestore();

  await cleanup();
});

describe('project create', () => {
  test('prompts for name and creates project', async () => {
    const consolaPromptMock = vi.spyOn(consola, 'prompt').mockResolvedValue('My New Project');

    await Effect.runPromise(
      cli([
        'node',
        'catalyst',
        'project',
        'create',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]).pipe(Effect.provide(AppLayer)),
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(consolaPromptMock).toHaveBeenCalledWith(
      'Enter a name for the new project:',
      expect.any(Object),
    );
    expect(consola.success).toHaveBeenCalledWith('Project "New Project" created successfully.');
    expect(consola.start).toHaveBeenCalledWith(
      'Writing project UUID to .bigcommerce/project.json...',
    );
    expect(consola.success).toHaveBeenCalledWith(
      'Project UUID written to .bigcommerce/project.json.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('projectUuid')).toBe('c23f5785-fd99-4a94-9fb3-945551623925');
    expect(config.get('framework')).toBe('catalyst');
    expect(config.get('storeHash')).toBe(storeHash);
    expect(config.get('accessToken')).toBe(accessToken);

    consolaPromptMock.mockRestore();
  });

  test('with insufficient credentials exits with error', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await expect(
      Effect.runPromise(
        cli(['node', 'catalyst', 'project', 'create']).pipe(Effect.provide(AppLayer)),
      ),
    ).rejects.toThrow('Missing credentials');

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('propagates create project API errors', async () => {
    server.use(
      http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 502 }),
      ),
    );

    const promptMock = vi.spyOn(consola, 'prompt').mockResolvedValue('Duplicate');

    await expect(
      Effect.runPromise(
        cli([
          'node',
          'catalyst',
          'project',
          'create',
          '--store-hash',
          storeHash,
          '--access-token',
          accessToken,
        ]).pipe(Effect.provide(AppLayer)),
      ),
    ).rejects.toThrow('Failed to create project, is the name already in use?');

    promptMock.mockRestore();
  });
});

describe('project list', () => {
  test('fetches and displays projects', async () => {
    await Effect.runPromise(
      cli([
        'node',
        'catalyst',
        'project',
        'list',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]).pipe(Effect.provide(AppLayer)),
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');
    expect(consola.log).toHaveBeenCalledWith('Project One (a23f5785-fd99-4a94-9fb3-945551623923)');
    expect(consola.log).toHaveBeenCalledWith('Project Two (b23f5785-fd99-4a94-9fb3-945551623924)');
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('with insufficient credentials exits with error', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await expect(
      Effect.runPromise(
        cli(['node', 'catalyst', 'project', 'list']).pipe(Effect.provide(AppLayer)),
      ),
    ).rejects.toThrow('Missing credentials');

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});

describe('project link', () => {
  test('sets projectUuid when called with --project-uuid', async () => {
    await Effect.runPromise(
      cli([
        'node',
        'catalyst',
        'project',
        'link',
        '--project-uuid',
        projectUuid1,
      ]).pipe(Effect.provide(AppLayer)),
    );

    expect(consola.start).toHaveBeenCalledWith(
      'Writing project UUID to .bigcommerce/project.json...',
    );
    expect(consola.success).toHaveBeenCalledWith(
      'Project UUID written to .bigcommerce/project.json.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(config.get('projectUuid')).toBe(projectUuid1);
    expect(config.get('framework')).toBe('catalyst');
  });

  test('fetches projects and prompts user to select one', async () => {
    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementation(async (message, opts) => {
        expect(message).toContain(
          'Select a project or create a new project (Press <enter> to select).',
        );

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const options = (opts as { options: Array<{ label: string; value: string }> }).options;

        expect(options).toHaveLength(3);
        expect(options[0]).toMatchObject({ label: 'Project One', value: projectUuid1 });
        expect(options[1]).toMatchObject({
          label: 'Project Two',
          value: projectUuid2,
        });
        expect(options[2]).toMatchObject({ label: 'Create a new project', value: 'create' });

        return new Promise((resolve) => resolve(projectUuid2));
      });

    await Effect.runPromise(
      cli([
        'node',
        'catalyst',
        'project',
        'link',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]).pipe(Effect.provide(AppLayer)),
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

    expect(consola.start).toHaveBeenCalledWith(
      'Writing project UUID to .bigcommerce/project.json...',
    );
    expect(consola.success).toHaveBeenCalledWith(
      'Project UUID written to .bigcommerce/project.json.',
    );

    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('projectUuid')).toBe(projectUuid2);
    expect(config.get('framework')).toBe('catalyst');
    expect(config.get('storeHash')).toBe(storeHash);
    expect(config.get('accessToken')).toBe(accessToken);

    consolaPromptMock.mockRestore();
  });

  test('prompts to create a new project', async () => {
    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementationOnce(async (message, opts) => {
        expect(message).toContain(
          'Select a project or create a new project (Press <enter> to select).',
        );

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const options = (opts as { options: Array<{ label: string; value: string }> }).options;

        expect(options).toHaveLength(3);
        expect(options[0]).toMatchObject({ label: 'Project One', value: projectUuid1 });
        expect(options[1]).toMatchObject({
          label: 'Project Two',
          value: projectUuid2,
        });
        expect(options[2]).toMatchObject({ label: 'Create a new project', value: 'create' });

        return new Promise((resolve) => resolve('create'));
      })
      .mockImplementationOnce(async (message) => {
        expect(message).toBe('Enter a name for the new project:');

        return new Promise((resolve) => resolve('New Project'));
      });

    await Effect.runPromise(
      cli([
        'node',
        'catalyst',
        'project',
        'link',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]).pipe(Effect.provide(AppLayer)),
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

    expect(consola.success).toHaveBeenCalledWith('Project "New Project" created successfully.');

    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('projectUuid')).toBe(projectUuid3);
    expect(config.get('framework')).toBe('catalyst');
    expect(config.get('storeHash')).toBe(storeHash);
    expect(config.get('accessToken')).toBe(accessToken);

    consolaPromptMock.mockRestore();
  });

  test('errors when create project API fails', async () => {
    server.use(
      http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 502 }),
      ),
    );

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementationOnce(async (message, opts) => {
        expect(message).toContain(
          'Select a project or create a new project (Press <enter> to select).',
        );

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const options = (opts as { options: Array<{ label: string; value: string }> }).options;

        expect(options).toHaveLength(3);
        expect(options[0]).toMatchObject({ label: 'Project One', value: projectUuid1 });
        expect(options[1]).toMatchObject({
          label: 'Project Two',
          value: projectUuid2,
        });
        expect(options[2]).toMatchObject({ label: 'Create a new project', value: 'create' });

        return new Promise((resolve) => resolve('create'));
      })
      .mockImplementationOnce(async (message) => {
        expect(message).toBe('Enter a name for the new project:');

        return new Promise((resolve) => resolve('New Project'));
      });

    await expect(
      Effect.runPromise(
        cli([
          'node',
          'catalyst',
          'project',
          'link',
          '--store-hash',
          storeHash,
          '--access-token',
          accessToken,
        ]).pipe(Effect.provide(AppLayer)),
      ),
    ).rejects.toThrow('Failed to create project, is the name already in use?');

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

    consolaPromptMock.mockRestore();
  });

  test('errors when infrastructure projects API is not found', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 403 }),
      ),
    );

    await expect(
      Effect.runPromise(
        cli([
          'node',
          'catalyst',
          'project',
          'link',
          '--store-hash',
          storeHash,
          '--access-token',
          accessToken,
        ]).pipe(Effect.provide(AppLayer)),
      ),
    ).rejects.toThrow(
      'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
  });

  test('errors when no projectUuid, storeHash, or accessToken are provided', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await expect(
      Effect.runPromise(
        cli(['node', 'catalyst', 'project', 'link']).pipe(Effect.provide(AppLayer)),
      ),
    ).rejects.toThrow('Missing credentials');

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.start).not.toHaveBeenCalled();
    expect(consola.success).not.toHaveBeenCalled();
    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );

    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
