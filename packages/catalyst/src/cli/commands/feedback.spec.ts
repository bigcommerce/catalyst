import { input } from '@inquirer/prompts';
import { Command } from 'commander';
import Conf from 'conf';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { canPrompt } from '../lib/can-prompt';
import { diagnosticsReportSection } from '../lib/diagnostics-section';
import { submitFeedback } from '../lib/feedback';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { feedback } from './feedback';

vi.mock('@inquirer/prompts', () => ({ input: vi.fn() }));
vi.mock('../lib/can-prompt', () => ({ canPrompt: vi.fn() }));
vi.mock('../lib/diagnostics-section', () => ({ diagnosticsReportSection: vi.fn() }));
vi.mock('../lib/feedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/feedback')>()),
  submitFeedback: vi.fn(),
}));

const inputMock = vi.mocked(input);
const canPromptMock = vi.mocked(canPrompt);
const submitFeedbackMock = vi.mocked(submitFeedback);

const report = { title: 'Catalyst CLI diagnostics', body: 'report' };

let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

beforeAll(async () => {
  process.env.CATALYST_TELEMETRY_DISABLED = '1';

  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  let tmpDir: string;

  [tmpDir, cleanup] = await mkTempDir();

  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);

  config = getProjectConfig();
});

beforeEach(() => {
  config.set('storeHash', 'test-store');
  config.set('accessToken', 'test-token');
  canPromptMock.mockReturnValue(false);
  vi.mocked(diagnosticsReportSection).mockReturnValue(report);
});

afterEach(() => {
  vi.clearAllMocks();
  config.clear();
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

test('sends the flag values with the diagnostic report, using the linked project', async () => {
  await run('--title', '  Deploy hangs  ', '--description', 'It stops at upload.');

  expect(inputMock).not.toHaveBeenCalled();
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    { title: 'Deploy hangs', description: 'It stops at upload.', diagnostics: [report] },
    'test-store',
    'test-token',
    'api.bigcommerce.com',
  );
  expect(consola.success).toHaveBeenCalledWith('Feedback sent. Thank you!');
});

test('--no-diagnostics sends no diagnostics', async () => {
  await run('--title', 't', '--description', 'd', '--no-diagnostics');

  expect(diagnosticsReportSection).not.toHaveBeenCalled();
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    { title: 't', description: 'd', diagnostics: [] },
    'test-store',
    'test-token',
    'api.bigcommerce.com',
  );
});

test('uses --store-hash, --access-token, and --api-host', async () => {
  await run(
    ...['--title', 't', '--description', 'd'],
    ...['--store-hash', 'other-store', '--access-token', 'other-token'],
    ...['--api-host', 'api.example.com'],
  );

  expect(submitFeedbackMock).toHaveBeenCalledWith(
    expect.anything(),
    'other-store',
    'other-token',
    'api.example.com',
  );
});

test('asks for missing values, and the prompt rejects a blank answer', async () => {
  canPromptMock.mockReturnValue(true);
  inputMock.mockResolvedValueOnce(' Prompted title ').mockResolvedValueOnce('Prompted description');

  await run();

  const validate = inputMock.mock.calls[0]?.[0].validate;

  expect(await validate?.('  ')).toBe('Title is required.');
  expect(await validate?.('ok')).toBe(true);
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Prompted title', description: 'Prompted description' }),
    'test-store',
    'test-token',
    'api.bigcommerce.com',
  );
});

test('fails without prompting when a value is missing and it cannot prompt', async () => {
  await expect(run('--title', 't')).rejects.toThrow(
    '--description is required when the CLI cannot prompt (no TTY or CI).',
  );

  expect(submitFeedbackMock).not.toHaveBeenCalled();
});

test('rejects an invalid flag value', async () => {
  await expect(run('--title', '   ', '--description', 'd')).rejects.toThrow('Title is required.');

  expect(submitFeedbackMock).not.toHaveBeenCalled();
});

test('fails before the prompts when there are no credentials', async () => {
  config.clear();
  canPromptMock.mockReturnValue(true);

  await expect(run()).rejects.toThrow('Missing credentials');

  expect(inputMock).not.toHaveBeenCalled();
});
