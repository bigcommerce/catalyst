import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { link } from './link';

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
    return {
      Telemetry: vi.fn().mockImplementation(() => {
        return {
          identify: mockIdentify,
          isEnabled: vi.fn(() => true),
          track: vi.fn(),
          analytics: {
            closeAndFlush: vi.fn(),
          },
        };
      }),
    };
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  config = getProjectConfig(tmpDir);
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  vi.restoreAllMocks();
  exitMock.mockRestore();

  await cleanup();
});

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
      expect.objectContaining({ flags: '--api-host <host>', defaultValue: 'api.bigcommerce.com' }),
      expect.objectContaining({ flags: '--project-uuid <uuid>' }),
      expect.objectContaining({ flags: '--root-dir <path>', defaultValue: process.cwd() }),
    ]),
  );
});

test('sets projectUuid when called with --project-uuid', async () => {
  await program.parseAsync([
    'node',
    'catalyst',
    'link',
    '--project-uuid',
    projectUuid1,
    '--root-dir',
    tmpDir,
  ]);

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
      // Assert the prompt message and options
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

      // Simulate selecting the second option
      return new Promise((resolve) => resolve(projectUuid2));
    });

  await program.parseAsync([
    'node',
    'catalyst',
    'link',
    '--store-hash',
    storeHash,
    '--access-token',
    accessToken,
    '--root-dir',
    tmpDir,
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
  expect(config.get('framework')).toBe('catalyst');

  consolaPromptMock.mockRestore();
});

test('prompts to create a new project', async () => {
  const consolaPromptMock = vi
    .spyOn(consola, 'prompt')
    .mockImplementationOnce(async (message, opts) => {
      // Assert the prompt message and options
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

      // Simulate selecting the create option
      return new Promise((resolve) => resolve('create'));
    })
    .mockImplementationOnce(async (message) => {
      expect(message).toBe('Enter a name for the new project:');

      return new Promise((resolve) => resolve('New Project'));
    });

  await program.parseAsync([
    'node',
    'catalyst',
    'link',
    '--store-hash',
    storeHash,
    '--access-token',
    accessToken,
    '--root-dir',
    tmpDir,
  ]);

  expect(mockIdentify).toHaveBeenCalledWith(storeHash);

  expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
  expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

  expect(consola.success).toHaveBeenCalledWith('Project "New Project" created successfully.');

  expect(exitMock).toHaveBeenCalledWith(0);

  expect(config.get('projectUuid')).toBe(projectUuid3);
  expect(config.get('framework')).toBe('catalyst');

  consolaPromptMock.mockRestore();
});

test('prompts to create a new project', async () => {
  server.use(
    http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
      HttpResponse.json({}, { status: 502 }),
    ),
  );

  const consolaPromptMock = vi
    .spyOn(consola, 'prompt')
    .mockImplementationOnce(async (message, opts) => {
      // Assert the prompt message and options
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

      // Simulate selecting the create option
      return new Promise((resolve) => resolve('create'));
    })
    .mockImplementationOnce(async (message) => {
      expect(message).toBe('Enter a name for the new project:');

      return new Promise((resolve) => resolve('New Project'));
    });

  await program.parseAsync([
    'node',
    'catalyst',
    'link',
    '--store-hash',
    storeHash,
    '--access-token',
    accessToken,
    '--root-dir',
    tmpDir,
  ]);

  expect(mockIdentify).toHaveBeenCalledWith(storeHash);

  expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
  expect(consola.success).toHaveBeenCalledWith('Projects fetched.');

  expect(consola.error).toHaveBeenCalledWith(
    'Failed to create project, is the name already in use?',
  );

  expect(exitMock).toHaveBeenCalledWith(1);

  consolaPromptMock.mockRestore();
});

test('errors when infrastructure projects API is not found', async () => {
  server.use(
    http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
      HttpResponse.json({}, { status: 403 }),
    ),
  );

  await program.parseAsync([
    'node',
    'catalyst',
    'link',
    '--store-hash',
    storeHash,
    '--access-token',
    accessToken,
    '--root-dir',
    tmpDir,
  ]);

  expect(mockIdentify).toHaveBeenCalledWith(storeHash);

  expect(consola.start).toHaveBeenCalledWith('Fetching projects...');
  expect(consola.error).toHaveBeenCalledWith(
    'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
  );
});

test('errors when no projectUuid, storeHash, or accessToken are provided', async () => {
  await program.parseAsync(['node', 'catalyst', 'link', '--root-dir', tmpDir]);

  expect(consola.start).not.toHaveBeenCalled();
  expect(consola.success).not.toHaveBeenCalled();
  expect(consola.error).toHaveBeenCalledWith('Insufficient information to link a project.');
  expect(consola.info).toHaveBeenCalledWith('Provide a project UUID with --project-uuid, or');
  expect(consola.info).toHaveBeenCalledWith(
    'Provide both --store-hash and --access-token to fetch and select a project.',
  );

  expect(exitMock).toHaveBeenCalledWith(1);
});
