import { password } from '@inquirer/prompts';
import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
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
import { setupCommerceHosting } from '../lib/commerce-hosting';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { getProjectState } from '../lib/project-state';
import { program } from '../program';

import { link, project } from './project';

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));
vi.mock('open', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@inquirer/prompts', () => ({
  password: vi.fn(),
}));

vi.mock('../lib/project-state', () => ({
  getProjectState: vi.fn(),
}));

vi.mock('../lib/install-dependencies', () => ({
  installDependencies: vi.fn().mockResolvedValue(undefined),
}));

const passwordMock = vi.mocked(password);

vi.mock('../lib/commerce-hosting', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/commerce-hosting')>();

  return {
    ...actual,
    setupCommerceHosting: vi.fn(),
  };
});

const transformedState = {
  projectUuid: 'abc-123',
  hasMiddleware: true,
  hasProxy: false,
  hasOpenNextDep: true,
  isLinked: true,
  isTransformed: true,
  isFullySetUp: true,
};

const untransformedState = {
  projectUuid: undefined,
  hasMiddleware: false,
  hasProxy: true,
  hasOpenNextDep: false,
  isLinked: false,
  isTransformed: false,
  isFullySetUp: false,
};

let exitMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const { mockIdentify } = vi.hoisted(() => ({
  mockIdentify: vi.fn(),
}));

const projectUuid1 = 'a23f5785-fd99-4a94-9fb3-945551623923';
const projectUuid2 = 'b23f5785-fd99-4a94-9fb3-945551623924';
const projectUuid3 = 'c23f5785-fd99-4a94-9fb3-945551623925';
const storeHash = 'test-store';
const accessToken = 'test-token';

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());

  vi.mock('../lib/telemetry', () => {
    const instance = {
      identify: mockIdentify,
      isEnabled: vi.fn(() => true),
      track: vi.fn(),
      correlationId: 'test-session-uuid',
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

beforeEach(() => {
  // Default to a fully-transformed project so existing tests skip the
  // post-link Commerce Hosting setup prompt. Override per-test as needed.
  vi.mocked(getProjectState).mockReturnValue(transformedState);
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

describe('project', () => {
  test('has create, link, list, and delete subcommands', () => {
    expect(project).toBeInstanceOf(Command);
    expect(project.name()).toBe('project');
    expect(project.description()).toBe('Manage your BigCommerce infrastructure project.');

    const createCmd = project.commands.find((cmd) => cmd.name() === 'create');

    expect(createCmd).toBeDefined();
    expect(createCmd?.description()).toContain('Create a new BigCommerce infrastructure project');

    const linkCmd = project.commands.find((cmd) => cmd.name() === 'link');

    expect(linkCmd).toBeDefined();
    expect(linkCmd?.description()).toContain(
      'Link your local Catalyst project to a BigCommerce infrastructure project',
    );

    const listCmd = project.commands.find((cmd) => cmd.name() === 'list');

    expect(listCmd).toBeDefined();
    expect(listCmd?.description()).toContain('List BigCommerce infrastructure projects');

    const deleteCmd = project.commands.find((cmd) => cmd.name() === 'delete');

    expect(deleteCmd).toBeDefined();
    expect(deleteCmd?.description()).toContain(
      'Permanently delete a BigCommerce infrastructure project',
    );
    expect(deleteCmd?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--force' }),
      ]),
    );
  });
});

describe('project create', () => {
  test('prompts for name and creates project', async () => {
    const consolaPromptMock = vi.spyOn(consola, 'prompt').mockResolvedValue('My New Project');

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'create',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

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
    expect(config.get('storeHash')).toBe(storeHash);
    expect(config.get('accessToken')).toBe(accessToken);

    consolaPromptMock.mockRestore();
  });

  test('runs interactive login when no credentials are provided', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    const consolaPromptMock = vi.spyOn(consola, 'prompt').mockResolvedValueOnce('My New Project');

    await program.parseAsync(['node', 'catalyst', 'project', 'create']);

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.info).toHaveBeenCalledWith(
      "You're not logged in yet. Let's get you authenticated before creating a project.",
    );
    expect(consola.success).toHaveBeenCalledWith('Logged in to store mock-store-hash.');
    expect(consola.success).toHaveBeenCalledWith('Project "New Project" created successfully.');
    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('storeHash')).toBe('mock-store-hash');
    expect(config.get('accessToken')).toBe('mock-access-token');
    expect(config.get('projectUuid')).toBe(projectUuid3);

    consolaPromptMock.mockRestore();
  });

  test('falls back to manual login when the device flow fails', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    passwordMock.mockResolvedValueOnce(accessToken);

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(storeHash)
      .mockResolvedValueOnce('My New Project');

    await program.parseAsync(['node', 'catalyst', 'project', 'create']);

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Browser login didn't work"));
    expect(consola.success).toHaveBeenCalledWith(`Logged in to store ${storeHash}.`);
    expect(consola.success).toHaveBeenCalledWith('Project "New Project" created successfully.');
    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('storeHash')).toBe(storeHash);
    expect(config.get('accessToken')).toBe(accessToken);

    consolaPromptMock.mockRestore();
  });

  test('exits cleanly when the user aborts the manual login fallback', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    const consolaPromptMock = vi.spyOn(consola, 'prompt').mockResolvedValueOnce(false);

    await program.parseAsync(['node', 'catalyst', 'project', 'create']);

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.info).toHaveBeenCalledWith(
      'Login aborted. Re-run `catalyst project create` when you have your credentials ready.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(config.get('projectUuid')).toBeUndefined();

    consolaPromptMock.mockRestore();
  });

  test('propagates create project API errors', async () => {
    server.use(
      http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 502 }),
      ),
    );

    const promptMock = vi.spyOn(consola, 'prompt').mockResolvedValue('Duplicate');

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'create',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow('Failed to create project, is the name already in use?');

    promptMock.mockRestore();
  });

  test('propagates 422 validation error', async () => {
    server.use(
      http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 422 }),
      ),
    );

    const promptMock = vi.spyOn(consola, 'prompt').mockResolvedValue('bad name');

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'create',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow(
      "The project name you entered doesn't meet the requirements. It must be 3–32 characters long and use only letters, numbers, hyphens (-), underscores (_), and periods (.)",
    );

    promptMock.mockRestore();
  });
});

describe('project list', () => {
  test('fetches and displays projects', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'list',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');
    expect(consola.log).toHaveBeenCalledWith('Project One (a23f5785-fd99-4a94-9fb3-945551623923)');
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('https://project-one.catalyst-sandbox.store'),
    );
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('https://vanity.project-one.example.com'),
    );
    expect(consola.log).toHaveBeenCalledWith('Project Two (b23f5785-fd99-4a94-9fb3-945551623924)');
    expect(consola.log).toHaveBeenCalledWith('  (not deployed)');
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('marks the currently linked project with [linked]', async () => {
    config.set('projectUuid', projectUuid2);

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'list',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    const logCalls = vi.mocked(consola.log).mock.calls.map(([msg]) => String(msg));

    const linkedLine = logCalls.find((line) => line.includes(projectUuid2));
    const otherLine = logCalls.find((line) => line.includes(projectUuid1));

    expect(linkedLine).toContain('[linked]');
    expect(otherLine).not.toContain('[linked]');
  });

  test('does not mark any project when nothing is linked', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'list',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    const logCalls = vi.mocked(consola.log).mock.calls.map(([msg]) => String(msg));

    expect(logCalls.every((line) => !line.includes('[linked]'))).toBe(true);
  });

  test('with insufficient credentials exits with error', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await expect(program.parseAsync(['node', 'catalyst', 'project', 'list'])).rejects.toThrow(
      'Missing credentials',
    );

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
  test('properly configured Command instance', () => {
    expect(link).toBeInstanceOf(Command);
    expect(link.name()).toBe('link');
    expect(link.description()).toBe(
      'Link your local Catalyst project to a BigCommerce infrastructure project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
    );
    expect(link.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({
          flags: '--api-host <host>',
          defaultValue: 'api.bigcommerce.com',
        }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
      ]),
    );
  });

  test('sets projectUuid when called with --project-uuid', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'link',
      '--project-uuid',
      projectUuid1,
    ]);

    expect(consola.start).toHaveBeenCalledWith(
      'Writing project UUID to .bigcommerce/project.json...',
    );
    expect(consola.success).toHaveBeenCalledWith(
      'Project UUID written to .bigcommerce/project.json.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(config.get('projectUuid')).toBe(projectUuid1);
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

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'link',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

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

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'link',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

    expect(consola.success).toHaveBeenCalledWith('Project "New Project" created successfully.');

    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('projectUuid')).toBe(projectUuid3);
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
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow('Failed to create project, is the name already in use?');

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

    consolaPromptMock.mockRestore();
  });

  test('errors when create project returns 422 validation error', async () => {
    server.use(
      http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 422 }),
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

        return new Promise((resolve) => resolve('bad name'));
      });

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow(
      "The project name you entered doesn't meet the requirements. It must be 3–32 characters long and use only letters, numbers, hyphens (-), underscores (_), and periods (.)",
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

    consolaPromptMock.mockRestore();
  });

  test('marks the currently linked project with [linked] in the select prompt', async () => {
    config.set('projectUuid', projectUuid2);

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementationOnce(async (_message, opts) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const options = (opts as { options: Array<{ label: string; value: string }> }).options;

        const linkedOption = options.find((o) => o.value === projectUuid2);
        const otherOption = options.find((o) => o.value === projectUuid1);

        expect(linkedOption?.label).toContain('[linked]');
        expect(otherOption?.label).not.toContain('[linked]');

        return Promise.resolve(projectUuid2);
      });

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'link',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    consolaPromptMock.mockRestore();
  });

  test('exits gracefully with guidance when user declines to create from empty list', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementation(async () => Promise.resolve(false));

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow('No infrastructure project linked');

    expect(consola.info).toHaveBeenCalledWith(
      "When you're ready to create a project, run `catalyst project create` or re-run `catalyst project link`.",
    );
    expect(exitMock).toHaveBeenCalledWith(0);

    consolaPromptMock.mockRestore();
  });

  test('errors when infrastructure projects API is not found', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({}, { status: 403 }),
      ),
    );

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow(
      'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
    );

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
  });

  describe('post-link Commerce Hosting setup prompt', () => {
    test('does not prompt when project is already transformed', async () => {
      const consolaPromptMock = vi.spyOn(consola, 'prompt');

      vi.mocked(getProjectState).mockReturnValue(transformedState);

      await program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--project-uuid',
        projectUuid1,
      ]);

      const promptMessages = consolaPromptMock.mock.calls.map(([msg]) => msg);

      expect(promptMessages).not.toContain(
        expect.stringContaining('not fully set up for Commerce Hosting'),
      );

      consolaPromptMock.mockRestore();
    });

    test('prompts and runs setup when user accepts', async () => {
      vi.mocked(getProjectState).mockReturnValue(untransformedState);

      const consolaPromptMock = vi.spyOn(consola, 'prompt').mockImplementation(async (message) => {
        expect(message).toContain('not fully set up for Commerce Hosting');

        return Promise.resolve(true);
      });

      await program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--project-uuid',
        projectUuid1,
      ]);

      expect(setupCommerceHosting).toHaveBeenCalledWith(
        expect.objectContaining({ projectUuid: projectUuid1 }),
      );
      expect(installDependencies).toHaveBeenCalled();

      consolaPromptMock.mockRestore();
    });

    test('skips setup when user declines', async () => {
      vi.mocked(getProjectState).mockReturnValue(untransformedState);

      const consolaPromptMock = vi
        .spyOn(consola, 'prompt')
        .mockImplementation(async () => Promise.resolve(false));

      await program.parseAsync([
        'node',
        'catalyst',
        'project',
        'link',
        '--project-uuid',
        projectUuid1,
      ]);

      expect(setupCommerceHosting).not.toHaveBeenCalled();
      expect(installDependencies).not.toHaveBeenCalled();

      consolaPromptMock.mockRestore();
    });
  });

  test('errors when no projectUuid, storeHash, or accessToken are provided', async () => {
    await expect(program.parseAsync(['node', 'catalyst', 'project', 'link'])).rejects.toThrow(
      'Missing credentials',
    );

    expect(consola.start).not.toHaveBeenCalled();
    expect(consola.success).not.toHaveBeenCalled();
    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );

    expect(exitMock).toHaveBeenCalledWith(1);
  });
});

describe('project delete', () => {
  test('with --project-uuid and --force deletes without prompting', async () => {
    const consolaPromptMock = vi.spyOn(consola, 'prompt');

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--project-uuid',
      projectUuid1,
      '--force',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consolaPromptMock).not.toHaveBeenCalled();
    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(consola.start).toHaveBeenCalledWith(`Deleting project ${projectUuid1}...`);
    expect(consola.success).toHaveBeenCalledWith(`Project ${projectUuid1} deleted.`);
    expect(exitMock).toHaveBeenCalledWith(0);

    consolaPromptMock.mockRestore();
  });

  test('with --project-uuid prompts for confirmation and deletes on accept', async () => {
    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementation(async (message, opts) => {
        expect(message).toContain('Are you sure you want to delete project');
        expect(message).toContain(projectUuid1);
        expect(message).toContain('irreversible');
        expect(opts).toMatchObject({ type: 'confirm' });

        return Promise.resolve(true);
      });

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--project-uuid',
      projectUuid1,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consolaPromptMock).toHaveBeenCalledTimes(1);
    expect(consola.success).toHaveBeenCalledWith(`Project ${projectUuid1} deleted.`);
    expect(exitMock).toHaveBeenCalledWith(0);

    consolaPromptMock.mockRestore();
  });

  test('aborts when user declines the confirmation prompt', async () => {
    let deleteRequested = false;

    server.use(
      http.delete(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid',
        () => {
          deleteRequested = true;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementation(async () => Promise.resolve(false));

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--project-uuid',
      projectUuid1,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(deleteRequested).toBe(false);
    expect(consola.info).toHaveBeenCalledWith('Aborted. No project was deleted.');
    expect(exitMock).toHaveBeenCalledWith(0);

    consolaPromptMock.mockRestore();
  });

  test('without --project-uuid fetches projects and prompts to select one', async () => {
    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementationOnce(async (message, opts) => {
        expect(message).toContain('Select a project to delete');

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const options = (opts as { options: Array<{ label: string; value: string }> }).options;

        expect(options).toHaveLength(3);
        expect(options[0]).toMatchObject({ label: 'Project One', value: projectUuid1 });
        expect(options[1]).toMatchObject({ label: 'Project Two', value: projectUuid2 });
        expect(options[2]).toMatchObject({ label: 'Cancel', value: 'cancel' });

        return Promise.resolve(projectUuid2);
      })
      .mockImplementationOnce(async (message) => {
        expect(message).toContain('"Project Two"');
        expect(message).toContain(projectUuid2);

        return Promise.resolve(true);
      });

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
    expect(consola.success).toHaveBeenCalledWith('Projects fetched.');
    expect(consola.success).toHaveBeenCalledWith(`Project ${projectUuid2} deleted.`);
    expect(exitMock).toHaveBeenCalledWith(0);

    consolaPromptMock.mockRestore();
  });

  test('marks the currently linked project with [linked] in the select prompt', async () => {
    config.set('projectUuid', projectUuid2);

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementationOnce(async (_message, opts) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const options = (opts as { options: Array<{ label: string; value: string }> }).options;

        const linkedOption = options.find((o) => o.value === projectUuid2);
        const otherOption = options.find((o) => o.value === projectUuid1);

        expect(linkedOption?.label).toContain('[linked]');
        expect(otherOption?.label).not.toContain('[linked]');

        return Promise.resolve(projectUuid1);
      })
      .mockImplementationOnce(async () => Promise.resolve(true));

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    consolaPromptMock.mockRestore();
  });

  test('aborts when user selects Cancel from the project list', async () => {
    let deleteRequested = false;

    server.use(
      http.delete(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid',
        () => {
          deleteRequested = true;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const consolaPromptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementation(async () => Promise.resolve('cancel'));

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consolaPromptMock).toHaveBeenCalledTimes(1);
    expect(deleteRequested).toBe(false);
    expect(consola.info).toHaveBeenCalledWith('Aborted. No project was deleted.');
    expect(exitMock).toHaveBeenCalledWith(0);

    consolaPromptMock.mockRestore();
  });

  test('exits cleanly when there are no projects to delete', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consola.info).toHaveBeenCalledWith('No projects found.');
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('clears linked projectUuid from config when the deleted project was linked', async () => {
    config.set('projectUuid', projectUuid1);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--project-uuid',
      projectUuid1,
      '--force',
    ]);

    expect(config.get('projectUuid')).toBeUndefined();
    expect(consola.info).toHaveBeenCalledWith(
      'Removed project UUID from .bigcommerce/project.json.',
    );
  });

  test('preserves linked projectUuid when a different project is deleted', async () => {
    config.set('projectUuid', projectUuid2);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    await program.parseAsync([
      'node',
      'catalyst',
      'project',
      'delete',
      '--project-uuid',
      projectUuid1,
      '--force',
    ]);

    expect(config.get('projectUuid')).toBe(projectUuid2);
    expect(consola.info).not.toHaveBeenCalledWith(
      'Removed project UUID from .bigcommerce/project.json.',
    );
  });

  test('with insufficient credentials exits with error', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await expect(program.parseAsync(['node', 'catalyst', 'project', 'delete'])).rejects.toThrow(
      'Missing credentials',
    );

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('throws when API returns 404', async () => {
    server.use(
      http.delete(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid',
        () => HttpResponse.json({}, { status: 404 }),
      ),
    );

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'delete',
        '--project-uuid',
        projectUuid1,
        '--force',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow(`Project ${projectUuid1} not found.`);
  });

  test('throws when API returns 403', async () => {
    server.use(
      http.delete(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid',
        () => HttpResponse.json({}, { status: 403 }),
      ),
    );

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'project',
        'delete',
        '--project-uuid',
        projectUuid1,
        '--force',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
      ]),
    ).rejects.toThrow(
      'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
    );
  });
});
