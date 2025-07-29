import { Command } from 'commander';
import consola from 'consola';
import { afterAll, afterEach, beforeAll, expect, MockInstance, test, vi } from 'vitest';

import { link } from '../../src/commands/link';
import { mkTempDir } from '../../src/lib/mk-temp-dir';
import { ProjectConfig } from '../../src/lib/project-config';
import { program } from '../../src/program';

let consolaStartMock: MockInstance;
let consolaSuccessMock: MockInstance;
let consolaInfoMock: MockInstance;
let consolaErrorMock: MockInstance;
let exitMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: ProjectConfig;

const projectUuid1 = 'a23f5785-fd99-4a94-9fb3-945551623923';
const projectUuid2 = 'b23f5785-fd99-4a94-9fb3-945551623924';
const storeHash = 'test-store';
const accessToken = 'test-token';

beforeAll(async () => {
  consolaStartMock = vi.spyOn(consola, 'start').mockImplementation(() => null);
  consolaSuccessMock = vi.spyOn(consola, 'success').mockImplementation(() => null);
  consolaInfoMock = vi.spyOn(consola, 'info').mockImplementation(() => null);
  consolaErrorMock = vi.spyOn(consola, 'error').mockImplementation(() => null);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  config = new ProjectConfig(tmpDir);
});

afterEach(() => {
  consolaStartMock.mockReset();
  consolaSuccessMock.mockReset();
  consolaInfoMock.mockReset();
  consolaErrorMock.mockReset();
});

afterAll(async () => {
  consolaStartMock.mockRestore();
  consolaSuccessMock.mockRestore();
  consolaInfoMock.mockRestore();
  consolaErrorMock.mockRestore();
  exitMock.mockRestore();

  await cleanup();
});

test('properly configured Command instance', () => {
  expect(link).toBeInstanceOf(Command);
  expect(link.name()).toBe('link');
  expect(link.description()).toBe('Link your local Catalyst repository to a BigCommerce project');
  expect(link.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ flags: '--store-hash <hash>' }),
      expect.objectContaining({ flags: '--access-token <token>' }),
      expect.objectContaining({ flags: '--api-host <host>', defaultValue: 'api.bigcommerce.com' }),
      expect.objectContaining({ flags: '--project-uuid <uuid>' }),
      expect.objectContaining({ flags: '--root-dir <rootDir>', defaultValue: process.cwd() }),
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

  expect(consolaStartMock).toHaveBeenCalledWith(
    'Project UUID provided, writing to .bigcommerce/project.json...',
  );
  expect(consolaSuccessMock).toHaveBeenCalledWith(
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
      expect(message).toContain('Select a project (Press <enter> to select).');

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const options = (opts as { options: Array<{ label: string; value: string }> }).options;

      expect(options).toHaveLength(2);
      expect(options[0]).toMatchObject({ label: 'Project One', value: projectUuid1 });
      expect(options[1]).toMatchObject({
        label: 'Project Two',
        value: projectUuid2,
      });

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

  expect(consolaStartMock.mock.calls[0][0]).toBe('Fetching projects...');
  expect(consolaSuccessMock.mock.calls[0][0]).toBe('Projects fetched.');

  expect(consolaStartMock.mock.calls[1][0]).toBe(
    'Writing project UUID to .bigcommerce/project.json...',
  );
  expect(consolaSuccessMock.mock.calls[1][0]).toBe(
    'Project UUID written to .bigcommerce/project.json.',
  );
  expect(exitMock).toHaveBeenCalledWith(0);
  expect(config.get('projectUuid')).toBe(projectUuid2);
  expect(config.get('framework')).toBe('catalyst');

  consolaPromptMock.mockRestore();
});

test('errors when no projectUuid, storeHash, or accessToken are provided', async () => {
  await program.parseAsync(['node', 'catalyst', 'link', '--root-dir', tmpDir]);

  expect(consolaStartMock).not.toHaveBeenCalled();
  expect(consolaSuccessMock).not.toHaveBeenCalled();
  expect(consolaErrorMock).toHaveBeenCalledWith('No project UUID provided');
  expect(consolaInfoMock.mock.calls[0][0]).toBe(
    'Please provide a project UUID using the --project-uuid flag',
  );
  expect(consolaInfoMock.mock.calls[1][0]).toBe(
    'Or provide a store hash and access token using the --store-hash and --access-token flags',
  );
  expect(exitMock).toHaveBeenCalledWith(1);
});
