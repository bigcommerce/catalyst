import { http, HttpResponse } from 'msw';
import { expect, test } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { UnauthorizedError } from './auth-errors';
import { UserActionableError } from './errors';
import {
  FEEDBACK_SOURCE,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  submitFeedback,
  validateFeedbackField,
} from './feedback';

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const url = `https://${apiHost}/stores/${storeHash}/v0/feedback`;

const feedback = {
  title: 'Deploy hangs',
  description: 'It stops at upload.',
  diagnostics: [{ title: 'Catalyst CLI diagnostics', body: 'report' }],
};

test('validateFeedbackField accepts a value within the limit', () => {
  expect(validateFeedbackField('Title', 'ok')).toBeUndefined();
  expect(validateFeedbackField('Title', 'a'.repeat(MAX_TITLE_LENGTH))).toBeUndefined();
  expect(validateFeedbackField('Description', 'a'.repeat(MAX_DESCRIPTION_LENGTH))).toBeUndefined();
});

test('validateFeedbackField rejects an empty or blank value', () => {
  expect(validateFeedbackField('Title', '')).toBe('Title is required.');
  expect(validateFeedbackField('Description', '   ')).toBe('Description is required.');
});

test('validateFeedbackField rejects a value over the limit', () => {
  expect(validateFeedbackField('Title', 'a'.repeat(MAX_TITLE_LENGTH + 1))).toBe(
    `Title must be at most ${MAX_TITLE_LENGTH} characters (got ${MAX_TITLE_LENGTH + 1}).`,
  );
  expect(validateFeedbackField('Description', 'a'.repeat(MAX_DESCRIPTION_LENGTH + 1))).toContain(
    `at most ${MAX_DESCRIPTION_LENGTH} characters`,
  );
});

test('validateFeedbackField counts characters, not UTF-16 code units', () => {
  // Each emoji is 2 UTF-16 code units but 1 character.
  expect(validateFeedbackField('Title', '😀'.repeat(MAX_TITLE_LENGTH))).toBeUndefined();
});

test('submitFeedback posts the feedback with the CLI source', async () => {
  let received: { headers: Headers; body: unknown } | undefined;

  server.use(
    http.post(url, async ({ request }) => {
      received = { headers: request.headers, body: await request.json() };

      return new HttpResponse(null, { status: 204 });
    }),
  );

  await submitFeedback(feedback, storeHash, accessToken, apiHost);

  expect(received?.headers.get('X-Auth-Token')).toBe(accessToken);
  expect(received?.headers.get('Content-Type')).toBe('application/json');
  expect(received?.body).toEqual({ source: FEEDBACK_SOURCE, ...feedback });
});

test('submitFeedback throws UnauthorizedError on 401', async () => {
  server.use(http.post(url, () => new HttpResponse(null, { status: 401 })));

  await expect(submitFeedback(feedback, storeHash, accessToken, apiHost)).rejects.toBeInstanceOf(
    UnauthorizedError,
  );
});

test('submitFeedback shows the API message on a 4xx', async () => {
  server.use(
    http.post(url, () =>
      HttpResponse.json(
        { status: 403, title: "You don't have a required scope to access the endpoint" },
        { status: 403 },
      ),
    ),
  );

  const error = await submitFeedback(feedback, storeHash, accessToken, apiHost).catch(
    (e: unknown) => e,
  );

  expect(error).toBeInstanceOf(UserActionableError);
  expect(error).toHaveProperty(
    'message',
    "Failed to submit feedback: You don't have a required scope to access the endpoint",
  );
});

test('submitFeedback throws a plain error on a 5xx', async () => {
  server.use(http.post(url, () => new HttpResponse(null, { status: 503 })));

  const error = await submitFeedback(feedback, storeHash, accessToken, apiHost).catch(
    (e: unknown) => e,
  );

  expect(error).toBeInstanceOf(Error);
  expect(error).not.toBeInstanceOf(UserActionableError);
  expect(error).toHaveProperty('message', expect.stringContaining('Failed to submit feedback'));
});
