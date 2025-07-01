import { cookies, headers } from 'next/headers';
import { AnonymousUser } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';

const anonymousCookieName = 'authjs.anonymous-session-token';

const shouldUseSecureCookie = async () => {
  const headersList = await headers();

  return headersList.get('x-forwarded-proto') === 'https';
};

export const anonymousSignIn = async (user: Partial<AnonymousUser> = { cartId: null }) => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const useSecureCookies = await shouldUseSecureCookie();
  const cookiePrefix = useSecureCookies ? '__Secure-' : '';

  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }

  const cookieJar = await cookies();
  const jwt = await encode({
    salt: `${cookiePrefix}${anonymousCookieName}`,
    secret,
    token: {
      user,
    },
  });

  cookieJar.set(`${cookiePrefix}${anonymousCookieName}`, jwt, {
    secure: true,
    sameSite: 'lax',
    // We set the maxAge to 7 days as a good default for anonymous sessions.
    // This can be adjusted based on your application's needs.
    maxAge: 60 * 60 * 7, // 7 days
    httpOnly: true,
  });
};

export const getAnonymousSession = async () => {
  const cookieJar = await cookies();
  const useSecureCookies = await shouldUseSecureCookie();
  const cookiePrefix = useSecureCookies ? '__Secure-' : '';
  const jwt = cookieJar.get(`${cookiePrefix}${anonymousCookieName}`);

  if (!jwt) {
    return null;
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }

  const session = await decode({
    secret,
    salt: `${cookiePrefix}${anonymousCookieName}`,
    token: jwt.value,
  });

  return session;
};

export const clearAnonymousSession = async () => {
  const cookieJar = await cookies();
  const useSecureCookies = await shouldUseSecureCookie();
  const cookiePrefix = useSecureCookies ? '__Secure-' : '';

  cookieJar.delete({
    name: `${cookiePrefix}${anonymousCookieName}`,
    secure: true,
    sameSite: 'lax',
    httpOnly: true,
  });
};

export const updateAnonymousSession = async (user: AnonymousUser) => {
  const session = await getAnonymousSession();

  if (!session) {
    return null;
  }

  await anonymousSignIn(user);
};
