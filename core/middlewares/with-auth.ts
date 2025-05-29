import { NextResponse, URLPattern } from 'next/server';

import { auth, signIn, signOut } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

// Path matcher for any routes that require authentication
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });
const sessionInvalidateParam = 'invalidate-session';

function redirectToLogin(url: string) {
  return NextResponse.redirect(new URL('/login', url), { status: 302 });
}

export const withAuth: MiddlewareFactory = (next) => {
  return async (request, event) => {
    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    const authWithCallback = auth(async (req) => {
      const isProtectedRoute = protectedPathPattern.test(req.nextUrl.toString().toLowerCase());
      const isGetRequest = req.method === 'GET';

      if (!req.auth) {
        await signIn('anonymous', { redirect: false });

        if (isProtectedRoute && isGetRequest) {
          return redirectToLogin(req.url);
        }

        return next(req, event);
      }

      const { customerAccessToken } = req.auth.user ?? {};

      if (isProtectedRoute && isGetRequest && !customerAccessToken) {
        return redirectToLogin(req.url);
      }

      // Continue the middleware chain
      return next(req, event);
    });

    if (request.nextUrl.searchParams.has(sessionInvalidateParam)) {
      await signOut({ redirect: false });

      request.nextUrl.searchParams.delete(sessionInvalidateParam);

      return NextResponse.redirect(request.nextUrl, { status: 302 });
    }

    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    return authWithCallback(request, event);
  };
};
