import { cookies } from 'next/headers';
import { AnonymousUser } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';

const anonymousCookieName = 'authjs.anonymous-session-token';

export const anonymousSignIn = async (user: Partial<AnonymousUser> = { cartId: null }) => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }

  const cookieJar = await cookies();
  const jwt = await encode({
    salt: anonymousCookieName,
    secret,
    token: {
      user,
    },
  });

  cookieJar.set(anonymousCookieName, jwt, {
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
  const jwt = cookieJar.get(anonymousCookieName);

  if (!jwt) {
    return null;
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }

  const session = await decode({
    secret,
    salt: anonymousCookieName,
    token: jwt.value,
  });

  return session;
};

export const clearAnonymousSession = async () => {
  const cookieJar = await cookies();

  cookieJar.delete(anonymousCookieName);
};

export const updateAnonymousSession = async (user: AnonymousUser) => {
  const session = await getAnonymousSession();

  if (!session) {
    return null;
  }

  await anonymousSignIn(user);
};
