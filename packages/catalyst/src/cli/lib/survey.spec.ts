import { input } from '@inquirer/prompts';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import PACKAGE_INFO from '../../../package.json';

import { submitFeedback } from './feedback';
import { consola } from './logger';
import { isSurveyDue, runSurvey } from './survey';

vi.mock('@inquirer/prompts', () => ({ input: vi.fn() }));
vi.mock('./feedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./feedback')>()),
  submitFeedback: vi.fn(),
}));

// In-memory user config, so tests never write to the real OS config dir.
const store = new Map<string, unknown>();
const userConfig = {
  get: (key: string) => store.get(key),
  set: (key: string, value: unknown) => store.set(key, value),
};

vi.mock('./user-config', () => ({ getUserConfig: () => userConfig }));

const inputMock = vi.mocked(input);
const submitFeedbackMock = vi.mocked(submitFeedback);

const context = {
  commandName: 'deploy',
  storeHash: 'test-store',
  accessToken: 'test-token',
  apiHost: 'api.bigcommerce.com',
};

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.parse('2026-10-01T00:00:00.000Z');

const promptError = (name: string) => Object.assign(new Error('prompt'), { name });

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

beforeEach(() => {
  vi.useFakeTimers({ now, toFake: ['Date'] });
  store.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

test('the survey is due on a machine that has never shown it', () => {
  expect(isSurveyDue()).toBe(true);
});

test('after the survey is shown, it is not due again for 90 days', async () => {
  inputMock.mockResolvedValueOnce('');

  await runSurvey(context);

  vi.setSystemTime(now + 90 * DAY_MS - 1);

  expect(isSurveyDue()).toBe(false);

  vi.setSystemTime(now + 90 * DAY_MS);

  expect(isSurveyDue()).toBe(true);
});

test('sends the score and the comment', async () => {
  inputMock.mockResolvedValueOnce(' 8 ').mockResolvedValueOnce('  Deploys are fast.  ');

  await runSurvey(context);

  // Each prompt closes on its own if nobody answers.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  expect(inputMock).toHaveBeenCalledWith(expect.anything(), { signal: expect.any(AbortSignal) });
  expect(submitFeedbackMock).toHaveBeenCalledWith(
    {
      title: 'CLI survey: 8/10',
      description: 'Deploys are fast.',
      diagnostics: [
        {
          title: 'Survey',
          body: `Score: 8/10\nCLI version: ${PACKAGE_INFO.version}\nCommand: deploy`,
        },
      ],
    },
    'test-store',
    'test-token',
    'api.bigcommerce.com',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { source: 'catalyst-cli-survey', signal: expect.any(AbortSignal) },
  );
  expect(consola.success).toHaveBeenCalledWith('Thank you for your feedback!');
});

test('sends a placeholder description when there is no comment', async () => {
  inputMock.mockResolvedValueOnce('0').mockResolvedValueOnce('');

  await runSurvey(context);

  expect(submitFeedbackMock.mock.calls[0]?.[0]).toMatchObject({
    title: 'CLI survey: 0/10',
    description: 'No comment.',
  });
});

test('Enter without a score skips the comment and sends nothing', async () => {
  inputMock.mockResolvedValueOnce('');

  await runSurvey(context);

  expect(inputMock).toHaveBeenCalledTimes(1);
  expect(submitFeedbackMock).not.toHaveBeenCalled();
  expect(consola.info).toHaveBeenCalledWith(
    'Skipped. We will not ask again for at least three months.',
  );
});

test('the score must be a whole number from 0 to 10, or empty', async () => {
  inputMock.mockResolvedValueOnce('');

  await runSurvey(context);

  const validate = inputMock.mock.calls[0]?.[0].validate;
  const check = (answers: string[]) => Promise.all(answers.map(async (a) => validate?.(a)));

  expect(new Set(await check(['', ' ', '0', ' 7 ', '10']))).toEqual(new Set([true]));
  expect(new Set(await check(['11', '-1', '7.5', '08', 'great']))).toEqual(
    new Set(['Enter a whole number from 0 to 10, or press Enter to skip.']),
  );
});

test('the comment is optional but limited to 5000 characters', async () => {
  inputMock.mockResolvedValueOnce('9').mockResolvedValueOnce('ok');

  await runSurvey(context);

  const validate = inputMock.mock.calls[1]?.[0].validate;

  expect(await validate?.('')).toBe(true);
  expect(await validate?.('a'.repeat(5000))).toBe(true);
  expect(await validate?.('a'.repeat(5001))).toBe(
    'Description must be at most 5000 characters (got 5001).',
  );
});

test.each(['ExitPromptError', 'AbortPromptError'])(
  'a %s (Ctrl+C or the prompt timeout) ends the survey quietly',
  async (name) => {
    inputMock.mockRejectedValueOnce(promptError(name));

    await expect(runSurvey(context)).resolves.toBeUndefined();

    expect(consola.warn).not.toHaveBeenCalled();
    expect(isSurveyDue()).toBe(false);
  },
);

test('a failed request warns and does not throw', async () => {
  inputMock.mockResolvedValueOnce('5').mockResolvedValueOnce('');
  submitFeedbackMock.mockRejectedValueOnce(new Error('network down'));

  await expect(runSurvey(context)).resolves.toBeUndefined();

  expect(consola.warn).toHaveBeenCalledWith(
    'Could not send your survey answer. Use `catalyst feedback` to send feedback.',
  );
});

test('a user config that cannot be written skips the survey', async () => {
  vi.spyOn(userConfig, 'set').mockImplementationOnce(() => {
    throw new Error('EACCES');
  });

  await expect(runSurvey(context)).resolves.toBeUndefined();

  expect(inputMock).not.toHaveBeenCalled();
});
