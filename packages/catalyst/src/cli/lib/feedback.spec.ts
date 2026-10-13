import { http, HttpResponse } from 'msw';
import { expect, test } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { UnauthorizedError } from './auth-errors';
import { UserActionableError } from './errors';
import { submitFeedback, validateFeedbackField } from './feedback';

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const url = `https://${apiHost}/stores/${storeHash}/v3/feedback`;

const feedback = {
  title: 'Deploy hangs',
  description: 'It stops at upload.',
  diagnostics: [{ title: 'Catalyst CLI diagnostics', body: 'report' }],
};

test('validateFeedbackField accepts values up to the server limits', () => {
  expect(validateFeedbackField('Title', 'a'.repeat(200))).toBeUndefined();
  expect(validateFeedbackField('Description', 'a'.repeat(5000))).toBeUndefined();
});

test('validateFeedbackField rejects a blank value', () => {
  expect(validateFeedbackField('Title', '   ')).toBe('Title is required.');
});

test('validateFeedbackField rejects a value over the limit', () => {
  expect(validateFeedbackField('Title', 'a'.repeat(201))).toBe(
    'Title must be at most 200 characters (got 201).',
  );
  expect(validateFeedbackField('Description', 'a'.repeat(5001))).toBe(
    'Description must be at most 5000 characters (got 5001).',
  );
});

test('validateFeedbackField counts characters, not UTF-16 code units', () => {
  // Each emoji is 2 UTF-16 code units but 1 character.
  expect(validateFeedbackField('Title', '😀'.repeat(200))).toBeUndefined();
});

test('submitFeedback posts the feedback with the token and the source', async () => {
  let received: { headers: Headers; body: unknown } | undefined;

  server.use(
    http.post(url, async ({ request }) => {
      received = { headers: request.headers, body: await request.json() };

      return new HttpResponse(null, { status: 204 });
    }),
  );

  await submitFeedback(feedback, storeHash, accessToken, apiHost);

  expect(received?.headers.get('X-Auth-Token')).toBe(accessToken);
  expect(received?.body).toEqual({ ...feedback, source: 'catalyst-cli' });

  await submitFeedback(feedback, storeHash, accessToken, apiHost, {
    source: 'catalyst-cli-survey',
  });

  expect(received?.body).toHaveProperty('source', 'catalyst-cli-survey');
});

test('submitFeedback throws UnauthorizedError for an expired token', async () => {
  server.use(http.post(url, () => new HttpResponse(null, { status: 401 })));

  await expect(submitFeedback(feedback, storeHash, accessToken, apiHost)).rejects.toBeInstanceOf(
    UnauthorizedError,
  );
});

test('submitFeedback shows the API message for a token without the required scope', async () => {
  server.use(
    http.post(url, () =>
      HttpResponse.json(
        { status: 403, title: "You don't have a required scope to access the endpoint" },
        { status: 403 },
      ),
    ),
  );

  await expect(submitFeedback(feedback, storeHash, accessToken, apiHost)).rejects.toThrow(
    new UserActionableError(
      "Failed to submit feedback: You don't have a required scope to access the endpoint",
    ),
  );
});
