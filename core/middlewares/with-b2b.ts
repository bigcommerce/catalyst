import { NextResponse } from 'next/server';
import { Session } from 'next-auth';

import { MiddlewareFactory } from './compose-middlewares';

export const withB2B: MiddlewareFactory = (next) => {
  return (request, event) => {
    const auth = request.auth;

    if (
      auth &&
      (request.nextUrl.pathname.includes('/account/') ||
        request.nextUrl.pathname.includes('/login'))
    ) {
      return NextResponse.redirect(new URL('/b2b/#/orders', request.url));
    }

    return next(request, event);
  };
};

declare module 'next/server' {
  interface NextRequest {
    auth?: Session;
  }
}
