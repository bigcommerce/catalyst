import { input } from '@inquirer/prompts';
import { Command } from 'commander';
import Conf from 'conf';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { canPrompt } from '../lib/can-prompt';
import { collectDiagnostics, type Diagnostics } from '../lib/collect-diagnostics';
import { UserActionableError } from '../lib/errors';
import { submitFeedback } from '../lib/feedback';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { feedback } from './feedback';

vi.mock('@inquirer/prompts', () => ({ input: vi.fn() }));
vi.mock('../lib/can-prompt', () => ({ canPrompt: vi.fn(() => false) }));
vi.mock('../lib/collect-diagnostics', () => ({ collectDiagnostics: vi.fn() }));
vi.mock('../lib/feedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/feedback')>()),
  submitFeedback: vi.fn(),
}));

const inputMock = vi.mocked(input);
const canPromptMock = vi.mocked(canPrompt);
const submitFeedbackMock = vi.mocked(submitFeedback);

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';

const diagnostics: Diagnostics = {
  cli: { name: '@bigcommerce/catalyst', version: '9.9.9' },
  runtime: {
    node: 'v22.0.0',
    platform: 'darwin',
    arch: 'arm64',
    osRelease: '25.0.0',
    packageManager: 'pnpm',
  },
  project: {
    cwd: join(homedir(), 'projects', 'shop'),
    storefrontName: '@bigcommerce/catalyst-core',
    storefrontVersion: '1.8.0',
    projectUuid: 'uuid-123',
    isLinked: true,
    isTransformed: true,
    isFullySetUp: true,
    hasMiddleware: false,
    hasProxy: true,
    hasOpenNextDep: true,
  },
  config: {
    storeHash: { present: true, source: 'project.json' },
    accessToken: { present: true, source: 'project.json' },
    projectUuid: { present: true, source: 'project.json' },
    apiHost: { present: false, source: 'unset' },
    projectJsonKeys: ['storeHash'],
    storedEnvKeys: [],
    cliEnvVars: {},
    buildEnvVars: {},
  },
  telemetry: { enabled: false, correlationId: 'corr-abc' },
  files: {},
};

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

beforeAll(async () => {
  process.env.CATALYST_TELEMETRY_DISABLED = '1';

  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);

  config = getProjectConfig();
});

beforeEach(() => {
  config.set('storeHash', storeHash);
  config.set('accessToken', accessToken);
  vi.mocked(collectDiagnostics).mockReturnValue(diagnostics);
  canPromptMock.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
  config.delete('storeHash');
  config.delete('accessToken');
});

afterAll(async () => {
  await cleanup();
});

const run = (...args: string[]) => program.parseAsync(['node', 'catalyst', 'feedback', ...args]);

test('properly configured Command instance', () => {
  expect(feedback).toBeInstanceOf(Command);
  expect(feedback.name()).toBe('feedback');
  expect(feedback.options.map((o) => o.long)).toEqual(
    expect.arrayContaining([
      '--title',
      '--description',
      '--no-diagnostics',
      '--store-hash',
      '--access-token',
      '--api-host',
    ]),
  );
});

test('sends the flag values with the diagnostic report attached', async () => {
  await run('--title', '  Deploy hangs  ', '--description', 'It stops at upload.');

  expect(inputMock).not.toHaveBeenCalled();
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    {
      title: 'Deploy hangs',
      description: 'It stops at upload.',
      diagnostics: [
        {
          title: 'Catalyst CLI diagnostics',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          body: expect.stringContaining('Catalyst CLI Diagnostics'),
        },
      ],
    },
    storeHash,
    accessToken,
    apiHost,
  );
  expect(consola.success).toHaveBeenCalledWith('Feedback sent. Thank you!');
});

test('replaces the home directory with ~ in the diagnostic report', async () => {
  await run('--title', 't', '--description', 'd');

  const body = submitFeedbackMock.mock.calls[0]?.[0].diagnostics[0]?.body ?? '';

  expect(body).toContain(`~${join('/', 'projects', 'shop')}`);
  expect(body).not.toContain(homedir());
});

test('keeps a directory outside the home directory as is', async () => {
  vi.mocked(collectDiagnostics).mockReturnValue({
    ...diagnostics,
    project: { ...diagnostics.project, cwd: '/srv/shop' },
  });

  await run('--title', 't', '--description', 'd');

  expect(submitFeedbackMock.mock.calls[0]?.[0].diagnostics[0]?.body).toContain('/srv/shop');
});

test('--no-diagnostics sends no diagnostics', async () => {
  await run('--title', 't', '--description', 'd', '--no-diagnostics');

  expect(collectDiagnostics).not.toHaveBeenCalled();
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    { title: 't', description: 'd', diagnostics: [] },
    storeHash,
    accessToken,
    apiHost,
  );
});

test('uses --store-hash, --access-token, and --api-host', async () => {
  await run(
    '--title',
    't',
    '--description',
    'd',
    '--store-hash',
    'other-store',
    '--access-token',
    'other-token',
    '--api-host',
    'api.example.com',
  );

  expect(submitFeedbackMock).toHaveBeenCalledWith(
    expect.anything(),
    'other-store',
    'other-token',
    'api.example.com',
  );
});

test('prompts for missing values when it can prompt', async () => {
  canPromptMock.mockReturnValue(true);
  inputMock.mockResolvedValueOnce(' Prompted title ').mockResolvedValueOnce('Prompted description');

  await run();

  expect(inputMock).toHaveBeenCalledTimes(2);
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Prompted title', description: 'Prompted description' }),
    storeHash,
    accessToken,
    apiHost,
  );
});

test('the prompt validates the answer', async () => {
  canPromptMock.mockReturnValue(true);
  inputMock.mockResolvedValue('answer');

  await run();

  const validate = inputMock.mock.calls[0]?.[0].validate;

  expect(await validate?.('')).toBe('Title is required.');
  expect(await validate?.('ok')).toBe(true);
});

test('fails without prompting when a value is missing and it cannot prompt', async () => {
  await expect(run('--title', 't')).rejects.toThrow(
    new UserActionableError('--description is required when the CLI cannot prompt (no TTY or CI).'),
  );

  expect(inputMock).not.toHaveBeenCalled();
  expect(submitFeedbackMock).not.toHaveBeenCalled();
});

test('rejects an invalid flag value', async () => {
  await expect(run('--title', '   ', '--description', 'd')).rejects.toThrow('Title is required.');

  expect(submitFeedbackMock).not.toHaveBeenCalled();
});

test('fails when credentials are missing', async () => {
  config.delete('storeHash');
  config.delete('accessToken');

  await expect(run('--title', 't', '--description', 'd')).rejects.toThrow('Missing credentials');

  expect(submitFeedbackMock).not.toHaveBeenCalled();
});
