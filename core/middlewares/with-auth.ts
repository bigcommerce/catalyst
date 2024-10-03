import { NextResponse } from 'next/server';

import { auth } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

const AUTH_PATHS = ['/login/', '/register/', '/change-password/'];

export const withAuth: MiddlewareFactory = (next) => {
  return async (request, event) => {
    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    const authWithCallback = auth(async (req) => {
      if (req.auth && AUTH_PATHS.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/account', req.nextUrl.origin));
      }

      // Continue the middleware chain
      return next(req, event);
    });

    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    return authWithCallback(request, event);
  };
};
