import { describe, expect, it } from 'vitest';

import { getSessionTokenCookieOptions } from './session-token-cookie-options';

describe('getSessionTokenCookieOptions', () => {
  it('uses the Auth.js defaults when no options are configured', () => {
    expect(getSessionTokenCookieOptions('authjs.session-token', {})).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false,
    });
  });

  it('uses secure cookies for Auth.js secure cookie names', () => {
    expect(getSessionTokenCookieOptions('__Secure-authjs.session-token', {})).toStrictEqual({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
    });
  });

  it('preserves configured options while excluding persistent cookie attributes', () => {
    expect(
      getSessionTokenCookieOptions('__Secure-authjs.session-token', {
        cookies: {
          sessionToken: {
            options: {
              secure: true,
              sameSite: 'none',
              partitioned: true,
              expires: new Date('2026-01-01'),
              maxAge: 60 * 60,
            },
          },
        },
      }),
    ).toStrictEqual({
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      secure: true,
      partitioned: true,
    });
  });
});
