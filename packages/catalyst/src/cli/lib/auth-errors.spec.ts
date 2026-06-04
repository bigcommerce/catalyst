import { describe, expect, test } from 'vitest';

import { assertAuthorized, UnauthorizedError } from './auth-errors';

const responseWith = (status: number) => new Response(null, { status });

describe('assertAuthorized', () => {
  test('throws UnauthorizedError on 401', () => {
    expect(() => assertAuthorized(responseWith(401))).toThrow(UnauthorizedError);
  });

  test.each([200, 403, 404, 500])('does not throw on %i', (status) => {
    expect(() => assertAuthorized(responseWith(status))).not.toThrow();
  });
});

describe('UnauthorizedError', () => {
  test('carries an actionable re-auth message', () => {
    const error = new UnauthorizedError();

    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toContain('catalyst auth login');
  });
});
