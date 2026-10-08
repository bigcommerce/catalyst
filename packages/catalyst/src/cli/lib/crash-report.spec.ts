import { Command } from '@commander-js/extra-typings';
import { confirm } from '@inquirer/prompts';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import PACKAGE_INFO from '../../../package.json';

import { canPrompt } from './can-prompt';
import {
  buildCrashReport,
  CRASH_REPORT_QUESTION,
  CRASH_REPORT_SOURCE,
  offerCrashReport,
  recordActiveCommand,
  resetActiveCommand,
} from './crash-report';
import { redactHome } from './diagnostics-section';
import { submitFeedback } from './feedback';
import { consola } from './logger';

vi.mock('@inquirer/prompts', () => ({ confirm: vi.fn() }));
vi.mock('./can-prompt', () => ({ canPrompt: vi.fn() }));
vi.mock('./diagnostics-section', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./diagnostics-section')>()),
  diagnosticsReportSection: () => ({ title: 'Catalyst CLI diagnostics', body: 'report' }),
}));
vi.mock('./feedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./feedback')>()),
  submitFeedback: vi.fn(),
}));

const projectConfig = new Map<string, string>();

vi.mock('./project-config', () => ({
  getProjectConfig: () => ({ get: (key: string) => projectConfig.get(key) }),
}));

const confirmMock = vi.mocked(confirm);
const submitFeedbackMock = vi.mocked(submitFeedback);

// A program with a `deploy` subcommand. Parsing it records the active command
// through the same preAction hook the CLI uses.
async function runProgram(...args: string[]) {
  const program = new Command()
    .exitOverride()
    .option('--no-hints')
    .addCommand(
      new Command('deploy')
        .option('--store-hash <hash>')
        .option('--access-token <token>')
        .action(() => undefined),
    )
    .hook('preAction', recordActiveCommand);

  await program.parseAsync(args, { from: 'user' });

  return program;
}

const error = new Error('Failed to create deployment: Something went wrong on our end.');

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

beforeEach(() => {
  vi.mocked(canPrompt).mockReturnValue(true);
  projectConfig.set('storeHash', 'config-store');
  projectConfig.set('accessToken', 'config-token');
});

afterEach(() => {
  vi.clearAllMocks();
  projectConfig.clear();
  resetActiveCommand();
});

/** buildCrashReport **************************************************************************** */

test('buildCrashReport includes the error, the stack, and the debug report', () => {
  const report = buildCrashReport(error, 'deploy', 'corr-123');

  expect(report.title).toBe(
    'CLI error in `deploy`: Failed to create deployment: Something went wrong on our end.',
  );
  expect(report.description).toBe(error.message);
  expect(report.diagnostics).toHaveLength(2);
  expect(report.diagnostics[0]?.title).toBe('Error');
  expect(report.diagnostics[0]?.body).toContain(
    `Command: deploy\nCorrelation ID: corr-123\nCLI version: ${PACKAGE_INFO.version}\n\n`,
  );
  expect(report.diagnostics[0]?.body).toContain(redactHome(error.stack ?? ''));
  expect(report.diagnostics[1]).toEqual({ title: 'Catalyst CLI diagnostics', body: 'report' });
});

test('buildCrashReport uses only the first line of the message in the title', () => {
  const report = buildCrashReport(new Error('first line\nsecond line'), 'deploy', 'c');

  expect(report.title).toBe('CLI error in `deploy`: first line');
  expect(report.description).toBe('first line\nsecond line');
});

test('buildCrashReport redacts the home directory', () => {
  const report = buildCrashReport(new Error(`ENOENT: ${join(homedir(), 'shop')}`), 'deploy', 'c');

  expect(report.description).toBe(`ENOENT: ~${join('/', 'shop')}`);
  expect(report.diagnostics[0]?.body).not.toContain(homedir());
});

test('buildCrashReport handles a value that is not an Error', () => {
  const report = buildCrashReport('boom', '', 'c');

  expect(report.title).toBe('CLI error: boom');
  expect(report.diagnostics[0]?.body).toContain('Command: (none)');
  expect(report.diagnostics[0]?.body).toMatch(/\n\nboom$/);
});

test('buildCrashReport handles an empty message and an Error without a stack', () => {
  const noStack = new Error('');

  noStack.stack = undefined;

  const report = buildCrashReport(noStack, 'deploy', 'c');

  expect(report.title).toBe('CLI error in `deploy`: Unknown error');
  expect(report.description).toBe('Unknown error');
});

test('buildCrashReport keeps fields within the server limits', () => {
  const report = buildCrashReport(new Error('x'.repeat(200_000)), 'deploy', 'c');

  expect(Array.from(report.title)).toHaveLength(200);
  expect(report.title.endsWith('…')).toBe(true);
  expect(Array.from(report.description)).toHaveLength(5000);
  expect(Array.from(report.diagnostics[0]?.body ?? '')).toHaveLength(100_000);
});

/** offerCrashReport **************************************************************************** */

test('sends the report when the user agrees', async () => {
  const program = await runProgram('deploy', '--store-hash', 'flag-store', '--access-token', 'tok');

  confirmMock.mockResolvedValueOnce(true);

  await offerCrashReport({ error, program, correlationId: 'corr-123' });

  expect(confirmMock).toHaveBeenCalledWith(
    { message: CRASH_REPORT_QUESTION, default: false },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { signal: expect.any(AbortSignal) },
  );
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    buildCrashReport(error, 'deploy', 'corr-123'),
    'flag-store',
    'tok',
    'api.bigcommerce.com',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { source: CRASH_REPORT_SOURCE, signal: expect.any(AbortSignal) },
  );
  expect(consola.success).toHaveBeenCalledWith('Error report sent. Thank you!');
});

test('sends nothing when the user declines', async () => {
  const program = await runProgram('deploy');

  confirmMock.mockResolvedValueOnce(false);

  await offerCrashReport({ error, program, correlationId: 'c' });

  expect(submitFeedbackMock).not.toHaveBeenCalled();
});

test('works before any command ran, with credentials from the project config', async () => {
  confirmMock.mockResolvedValueOnce(true);

  await offerCrashReport({ error, program: new Command(), correlationId: 'c' });

  expect(submitFeedbackMock).toHaveBeenCalledWith(
    buildCrashReport(error, '', 'c'),
    'config-store',
    'config-token',
    'api.bigcommerce.com',
    expect.anything(),
  );
});

test('prints a hint instead of asking when the CLI cannot prompt', async () => {
  vi.mocked(canPrompt).mockReturnValue(false);

  await offerCrashReport({ error, program: await runProgram('deploy'), correlationId: 'c' });

  expect(confirmMock).not.toHaveBeenCalled();
  expect(consola.info).toHaveBeenCalledWith('To report this error, run `catalyst feedback`.');
});

test('prints a hint instead of asking when there are no credentials', async () => {
  projectConfig.clear();

  await offerCrashReport({ error, program: await runProgram('deploy'), correlationId: 'c' });

  expect(confirmMock).not.toHaveBeenCalled();
  expect(consola.info).toHaveBeenCalledWith('To report this error, run `catalyst feedback`.');
});

test('--no-hints turns off the prompt and the hint', async () => {
  await offerCrashReport({
    error,
    program: await runProgram('--no-hints', 'deploy'),
    correlationId: 'c',
  });

  expect(confirmMock).not.toHaveBeenCalled();
  expect(consola.info).not.toHaveBeenCalled();
});

test('does not offer a report when the crash is Ctrl+C at a prompt', async () => {
  const exitError = new Error('User force closed the prompt');

  exitError.name = 'ExitPromptError';

  await offerCrashReport({ error: exitError, program: new Command(), correlationId: 'c' });

  expect(confirmMock).not.toHaveBeenCalled();
});

test('Ctrl+C or a timeout at the question ends without a message', async () => {
  const abortError = new Error('aborted');

  abortError.name = 'AbortPromptError';
  confirmMock.mockRejectedValueOnce(abortError);

  await expect(
    offerCrashReport({ error, program: await runProgram('deploy'), correlationId: 'c' }),
  ).resolves.toBeUndefined();

  expect(consola.warn).not.toHaveBeenCalled();
});

test('a failed request warns and does not throw', async () => {
  confirmMock.mockResolvedValueOnce(true);
  submitFeedbackMock.mockRejectedValueOnce(new Error('network down'));

  await expect(
    offerCrashReport({ error, program: await runProgram('deploy'), correlationId: 'c' }),
  ).resolves.toBeUndefined();

  expect(consola.warn).toHaveBeenCalledWith(
    'Could not send the error report. To report this error, run `catalyst feedback`.',
  );
});
