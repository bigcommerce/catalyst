import { getIronSession } from 'iron-session/edge';
import { NextResponse } from 'next/server';

import { sessionOptions } from '~/lib/session';

import { type MiddlewareFactory } from './compose-middlewares';

const AUTHENTICATED_PATHS = ['/account'];

export const withSessionManagement: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const response = NextResponse.next();
    const session = await getIronSession(request, response, {
      cookieName: sessionOptions.cookieName,
      password: sessionOptions.password,
      // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
      },
    });

    if (!session.customer?.id && AUTHENTICATED_PATHS.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return next(request, event);
  };
};
