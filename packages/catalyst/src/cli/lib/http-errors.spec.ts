import { HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { UserActionableError } from './errors';
import { extractApiErrorMessage, httpError } from './http-errors';

describe('extractApiErrorMessage', () => {
  test('prefers the server detail', () => {
    expect(
      extractApiErrorMessage({ title: 'Bad Request', detail: 'The domain is already claimed.' }),
    ).toBe('The domain is already claimed.');
  });

  test('falls back to the title when there is no detail', () => {
    expect(extractApiErrorMessage({ title: 'Not Found' })).toBe('Not Found');
  });

  test('enriches the headline with field-level errors', () => {
    expect(
      extractApiErrorMessage({
        title: 'Invalid request.',
        errors: { name: 'must be at least 3 characters' },
      }),
    ).toBe('Invalid request. (name: must be at least 3 characters)');
  });

  test('returns field errors alone when there is no title or detail', () => {
    expect(extractApiErrorMessage({ errors: { name: 'is required' } })).toBe('name: is required');
  });

  test('returns undefined for a body that is not the v3 envelope', () => {
    expect(extractApiErrorMessage(null)).toBeUndefined();
    expect(extractApiErrorMessage('oops')).toBeUndefined();
    expect(extractApiErrorMessage({ unrelated: true })).toBeUndefined();
  });
});

describe('httpError', () => {
  test('surfaces the API body message on a 4xx', async () => {
    const response = HttpResponse.json(
      { title: 'Bad Request', detail: 'The project name is already in use.' },
      { status: 400 },
    );

    const error = await httpError(response, 'Failed to create project');

    // A 4xx is a clear, user-actionable response — no Correlation ID/support framing.
    expect(error).toBeInstanceOf(UserActionableError);
    expect(error.message).toBe('Failed to create project: The project name is already in use.');
  });

  test('surfaces the API body message on a 5xx but keeps it a plain Error', async () => {
    const response = HttpResponse.json(
      { title: 'Bad Gateway', detail: 'Upstream is unavailable.' },
      { status: 502 },
    );

    const error = await httpError(response, 'Failed to fetch logs');

    // A 5xx is a server-side failure worth escalating — stays a plain Error so
    // the top-level handler keeps the Correlation ID + support framing.
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(UserActionableError);
    expect(error.message).toBe('Failed to fetch logs: Upstream is unavailable.');
  });

  test('falls back to user-actionable copy for a 4xx with an empty body', async () => {
    const response = new HttpResponse(null, { status: 403 });

    const error = await httpError(response, 'Failed to fetch projects');

    expect(error).toBeInstanceOf(UserActionableError);
    expect(error.message).toBe(
      'Failed to fetch projects: The request was rejected. Check your input — your access token may be missing a required scope, or the resource may not exist.',
    );
  });

  test('falls back to transient copy for a 5xx with an empty body', async () => {
    const response = new HttpResponse(null, { status: 500 });

    const error = await httpError(response, 'Failed to fetch logs');

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(UserActionableError);
    expect(error.message).toBe(
      'Failed to fetch logs: Something went wrong on our end. Please try again. If the issue persists, contact support.',
    );
  });

  test('falls back gracefully when the body is unparseable JSON', async () => {
    const response = new HttpResponse('<html>Bad Gateway</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });

    const error = await httpError(response, 'Failed to upload bundle');

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(UserActionableError);
    expect(error.message).toBe(
      'Failed to upload bundle: Something went wrong on our end. Please try again. If the issue persists, contact support.',
    );
  });
});
