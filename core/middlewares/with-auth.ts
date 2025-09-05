import { NextResponse, URLPattern } from 'next/server';

import { anonymousSignIn, auth, clearAnonymousSession, getAnonymousSession } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

// Path matcher for any routes that require authentication
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });

function redirectToLogin(url: string) {
  return NextResponse.redirect(new URL('/login', url), { status: 302 });
}

export const withAuth: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const authWithCallback = auth(async (req) => {
      let anonymousSession = await getAnonymousSession();
      const isProtectedRoute = protectedPathPattern.test(req.nextUrl.toString().toLowerCase());
      const isGetRequest = req.method === 'GET';

      // Check if the anonymous session is invalid and clear it if so
      if (
        anonymousSession &&
        typeof anonymousSession === 'object' &&
        'invalid' in anonymousSession
      ) {
        await clearAnonymousSession();
        // Set to null so we treat it as no session
        anonymousSession = null;
      }

      // Create the anonymous session if it doesn't exist
      if (!req.auth && !anonymousSession) {
        await anonymousSignIn();
      }

      // If the user is authenticated and there is an anonymous session, clear the anonymous session
      if (req.auth && anonymousSession) {
        await clearAnonymousSession();
      }

      if (!req.auth) {
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

    return authWithCallback(request, event);
  };
};
