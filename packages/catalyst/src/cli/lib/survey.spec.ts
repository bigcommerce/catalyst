import { input } from '@inquirer/prompts';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import PACKAGE_INFO from '../../../package.json';

import { submitFeedback } from './feedback';
import { consola } from './logger';
import {
  isSurveyDue,
  markSurveyShown,
  parseScore,
  runSurvey,
  SURVEY_INTERVAL_MS,
  SURVEY_SOURCE,
} from './survey';
import { getUserConfig } from './user-config';

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

const now = Date.parse('2026-10-01T00:00:00.000Z');

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

beforeEach(() => {
  store.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

test('parseScore', () => {
  expect(parseScore('')).toBeNull();
  expect(parseScore('   ')).toBeNull();
  expect(parseScore('0')).toBe(0);
  expect(parseScore(' 10 ')).toBe(10);
  expect(parseScore('11')).toBeUndefined();
  expect(parseScore('-1')).toBeUndefined();
  expect(parseScore('7.5')).toBeUndefined();
  expect(parseScore('abc')).toBeUndefined();
  expect(parseScore('100')).toBeUndefined();
});

test('the survey is due when it was never shown', () => {
  expect(isSurveyDue(now)).toBe(true);
});

test('the survey is not due again until the interval has passed', () => {
  markSurveyShown(now);

  expect(getUserConfig().get('survey.lastShownAt')).toBe('2026-10-01T00:00:00.000Z');
  expect(isSurveyDue(now + SURVEY_INTERVAL_MS - 1)).toBe(false);
  expect(isSurveyDue(now + SURVEY_INTERVAL_MS)).toBe(true);
});

test('an unreadable timestamp counts as never shown', () => {
  getUserConfig().set('survey.lastShownAt', 'not-a-date');

  expect(isSurveyDue(now)).toBe(true);
});

test('defaults to the current time', () => {
  markSurveyShown();

  expect(isSurveyDue()).toBe(false);
});

test('sends the score and the comment', async () => {
  inputMock.mockResolvedValueOnce('8').mockResolvedValueOnce('  Deploys are fast.  ');

  await runSurvey(context, now);

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
    { source: SURVEY_SOURCE, signal: expect.any(AbortSignal) },
  );
  expect(consola.success).toHaveBeenCalledWith('Thank you for your feedback!');
  expect(isSurveyDue(now)).toBe(false);
});

test('sends a placeholder description when there is no comment', async () => {
  inputMock.mockResolvedValueOnce('0').mockResolvedValueOnce('');

  await runSurvey(context, now);

  expect(submitFeedbackMock.mock.calls[0]?.[0]).toMatchObject({
    title: 'CLI survey: 0/10',
    description: 'No comment.',
  });
});

test('an empty score skips the survey and marks it shown', async () => {
  inputMock.mockResolvedValueOnce('');

  await runSurvey(context, now);

  expect(inputMock).toHaveBeenCalledTimes(1);
  expect(submitFeedbackMock).not.toHaveBeenCalled();
  expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('three months'));
  expect(isSurveyDue(now)).toBe(false);
});

test('the prompts validate the answers', async () => {
  inputMock.mockResolvedValueOnce('9').mockResolvedValueOnce('ok');

  await runSurvey(context, now);

  const validateScore = inputMock.mock.calls[0]?.[0].validate;
  const validateComment = inputMock.mock.calls[1]?.[0].validate;

  expect(await validateScore?.('')).toBe(true);
  expect(await validateScore?.('10')).toBe(true);
  expect(await validateScore?.('12')).toContain('0 to 10');
  expect(await validateComment?.('ok')).toBe(true);
  expect(await validateComment?.('a'.repeat(5001))).toContain('at most 5000');
});

test('Ctrl+C at a prompt ends the survey without a message', async () => {
  const exitError = new Error('User force closed the prompt');

  exitError.name = 'ExitPromptError';
  inputMock.mockRejectedValueOnce(exitError);

  await expect(runSurvey(context, now)).resolves.toBeUndefined();

  expect(consola.warn).not.toHaveBeenCalled();
  expect(isSurveyDue(now)).toBe(false);
});

test('the prompt timeout ends the survey without a message', async () => {
  const abortError = new Error('Prompt was aborted');

  abortError.name = 'AbortPromptError';
  inputMock.mockRejectedValueOnce(abortError);

  await expect(runSurvey(context, now)).resolves.toBeUndefined();

  expect(inputMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  expect(consola.warn).not.toHaveBeenCalled();
});

test('a user config that cannot be written does not throw', async () => {
  vi.spyOn(userConfig, 'set').mockImplementationOnce(() => {
    throw new Error('EACCES');
  });

  await expect(runSurvey(context, now)).resolves.toBeUndefined();

  expect(inputMock).not.toHaveBeenCalled();
});

test('a failed request warns and does not throw', async () => {
  inputMock.mockResolvedValueOnce('5').mockResolvedValueOnce('');
  submitFeedbackMock.mockRejectedValueOnce(new Error('network down'));

  await expect(runSurvey(context, now)).resolves.toBeUndefined();

  expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('catalyst feedback'));
});

test('a non-Error failure warns and does not throw', async () => {
  inputMock.mockRejectedValueOnce('boom');

  await expect(runSurvey(context, now)).resolves.toBeUndefined();

  expect(consola.warn).toHaveBeenCalled();
});

test('defaults the time to now', async () => {
  inputMock.mockResolvedValueOnce('');

  await runSurvey(context);

  expect(isSurveyDue()).toBe(false);
});
