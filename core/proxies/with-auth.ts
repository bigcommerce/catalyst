import { NextResponse, URLPattern } from 'next/server';

import { anonymousSignIn, auth, clearAnonymousSession, getAnonymousSession } from '~/auth';

import { type ProxyFactory } from './compose-proxies';

// Path matcher for any routes that require authentication
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });
const SESSION_TOKEN_COOKIE_RE = /^(__Secure-)?authjs\.session-token(\.\d+)?=/;

function redirectToLogin(url: string) {
  return NextResponse.redirect(new URL('/login', url), { status: 302 });
}

// Auth.js always sets Expires on session cookies based on session.maxAge. We strip it here
// so the cookie becomes a session cookie (expires when the browser closes), which is required
// for Essential cookie classification compliance.
function stripSessionCookieExpiry(response: Response): Response {
  const setCookies = response.headers.getSetCookie();
  const stripped = setCookies.map((cookie) =>
    SESSION_TOKEN_COOKIE_RE.test(cookie)
      ? cookie.replace(/;\s*(?:expires|max-age)=[^;]+/gi, '')
      : cookie,
  );

  if (stripped.every((c, i) => c === setCookies[i])) return response;

  const modified = new Response(response.body, response);

  modified.headers.delete('set-cookie');
  stripped.forEach((cookie) => modified.headers.append('set-cookie', cookie));

  return modified;
}

export const withAuth: ProxyFactory = (next) => {
  return async (request, event) => {
    const response = await auth(async (req) => {
      const anonymousSession = await getAnonymousSession();
      const isProtectedRoute = protectedPathPattern.test(req.nextUrl.toString().toLowerCase());
      const isGetRequest = req.method === 'GET';

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

      // Continue the proxy chain
      return next(req, event);
    })(request, event);

    return response ? stripSessionCookieExpiry(response) : response;
  };
};
