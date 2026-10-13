import { Command } from '@commander-js/extra-typings';
import { confirm } from '@inquirer/prompts';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import PACKAGE_INFO from '../../../package.json';

import { canPrompt } from './can-prompt';
import { buildCrashReport, offerCrashReport, recordActiveCommand } from './crash-report';
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
// No linked project: credentials come only from the flags.
vi.mock('./project-config', () => ({ getProjectConfig: () => ({ get: () => undefined }) }));

const confirmMock = vi.mocked(confirm);
const submitFeedbackMock = vi.mocked(submitFeedback);

// Runs `deploy` in a program with the same preAction hook as the CLI, so the
// crash report sees it as the active command.
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

const credentials = ['--store-hash', 'test-store', '--access-token', 'test-token'];

const error = Object.assign(
  new Error('Failed to create deployment: Something went wrong on our end.'),
  { stack: 'Error: Failed to create deployment\n    at deploy (/srv/cli.js:1:1)' },
);

const promptError = (name: string) => Object.assign(new Error('prompt'), { name });

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

beforeEach(() => {
  vi.mocked(canPrompt).mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

/** buildCrashReport **************************************************************************** */

test('buildCrashReport includes the error, the stack, and the debug report', () => {
  const report = buildCrashReport(error, 'corr-123', 'deploy');

  expect(report).toEqual({
    title: 'CLI error in `deploy`: Failed to create deployment: Something went wrong on our end.',
    description: error.message,
    diagnostics: [
      {
        title: 'Error',
        body: `Command: deploy\nCorrelation ID: corr-123\nCLI version: ${PACKAGE_INFO.version}\n\n${error.stack}`,
      },
      { title: 'Catalyst CLI diagnostics', body: 'report' },
    ],
  });
});

test('buildCrashReport uses only the first line of the message in the title', () => {
  const report = buildCrashReport(new Error('first line\nsecond line'), 'c', 'deploy');

  expect(report.title).toBe('CLI error in `deploy`: first line');
  expect(report.description).toBe('first line\nsecond line');
});

test('buildCrashReport replaces the home directory with ~', () => {
  const report = buildCrashReport(new Error(`ENOENT: ${join(homedir(), 'shop')}`), 'c');

  expect(report.description).toBe(`ENOENT: ~${join('/', 'shop')}`);
  expect(report.diagnostics[0]?.body).not.toContain(homedir());
});

test('buildCrashReport handles a rejection with a string and no active command', () => {
  const report = buildCrashReport('boom', 'c');

  expect(report.title).toBe('CLI error: boom');
  expect(report.diagnostics[0]?.body).toMatch(/^Command: \(none\)\n[\s\S]*\n\nboom$/);
});

test('buildCrashReport handles an error without a message', () => {
  expect(buildCrashReport(new Error(''), 'c', 'deploy')).toMatchObject({
    title: 'CLI error in `deploy`: Unknown error',
    description: 'Unknown error',
  });
});

test('buildCrashReport keeps fields within the server limits', () => {
  const report = buildCrashReport(new Error('x'.repeat(200_000)), 'c', 'deploy');

  expect(Array.from(report.title)).toHaveLength(200);
  expect(report.title.endsWith('…')).toBe(true);
  expect(Array.from(report.description)).toHaveLength(5000);
  expect(Array.from(report.diagnostics[0]?.body ?? '')).toHaveLength(100_000);
});

/** offerCrashReport **************************************************************************** */

test('sends the report with the credentials of the failed command when the user agrees', async () => {
  const program = await runProgram('deploy', ...credentials);

  confirmMock.mockResolvedValueOnce(true);

  await offerCrashReport({ error, program, correlationId: 'corr-123' });

  // The question defaults to No and closes on its own if nobody answers.
  expect(confirmMock).toHaveBeenCalledWith(expect.objectContaining({ default: false }), {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    signal: expect.any(AbortSignal),
  });
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    buildCrashReport(error, 'corr-123', 'deploy'),
    'test-store',
    'test-token',
    'api.bigcommerce.com',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { source: 'catalyst-cli-crash', signal: expect.any(AbortSignal) },
  );
  expect(consola.success).toHaveBeenCalledWith('Error report sent. Thank you!');
});

test('sends nothing when the user declines', async () => {
  const program = await runProgram('deploy', ...credentials);

  confirmMock.mockResolvedValueOnce(false);

  await offerCrashReport({ error, program, correlationId: 'c' });

  expect(submitFeedbackMock).not.toHaveBeenCalled();
});

test.each([
  ['the CLI cannot prompt', credentials, () => vi.mocked(canPrompt).mockReturnValue(false)],
  ['there are no credentials', [], () => undefined],
])('prints a hint instead of asking when %s', async (_name, args, arrange) => {
  arrange();

  await offerCrashReport({
    error,
    program: await runProgram('deploy', ...args),
    correlationId: 'c',
  });

  expect(confirmMock).not.toHaveBeenCalled();
  expect(consola.info).toHaveBeenCalledWith('To report this error, run `catalyst feedback`.');
});

test('--no-hints turns off the question and the hint', async () => {
  await offerCrashReport({
    error,
    program: await runProgram('--no-hints', 'deploy', ...credentials),
    correlationId: 'c',
  });

  expect(confirmMock).not.toHaveBeenCalled();
  expect(consola.info).not.toHaveBeenCalled();
});

test('does not ask when the crash is Ctrl+C at a command prompt', async () => {
  await offerCrashReport({
    error: promptError('ExitPromptError'),
    program: await runProgram('deploy', ...credentials),
    correlationId: 'c',
  });

  expect(confirmMock).not.toHaveBeenCalled();
});

test('Ctrl+C or a timeout at the question ends without a message', async () => {
  confirmMock.mockRejectedValueOnce(promptError('AbortPromptError'));

  await expect(
    offerCrashReport({
      error,
      program: await runProgram('deploy', ...credentials),
      correlationId: 'c',
    }),
  ).resolves.toBeUndefined();

  expect(consola.warn).not.toHaveBeenCalled();
});

test('a failed request warns and does not throw', async () => {
  confirmMock.mockResolvedValueOnce(true);
  submitFeedbackMock.mockRejectedValueOnce(new Error('network down'));

  await expect(
    offerCrashReport({
      error,
      program: await runProgram('deploy', ...credentials),
      correlationId: 'c',
    }),
  ).resolves.toBeUndefined();

  expect(consola.warn).toHaveBeenCalledWith(
    'Could not send the error report. To report this error, run `catalyst feedback`.',
  );
});
