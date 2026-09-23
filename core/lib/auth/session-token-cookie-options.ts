import { type NextAuthConfig } from 'next-auth';

export function getSessionTokenCookieOptions(
  name: string,
  config: Pick<NextAuthConfig, 'cookies'>,
) {
  const {
    expires: _expires,
    maxAge: _maxAge,
    ...sessionTokenCookieOptions
  } = config.cookies?.sessionToken?.options ?? {};

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: name.startsWith('__Secure-'),
    ...sessionTokenCookieOptions,
  };
}
