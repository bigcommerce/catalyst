import { NextResponse } from 'next/server';
import { Session } from 'next-auth';

import { MiddlewareFactory } from './compose-middlewares';

export const withB2B: MiddlewareFactory = (next) => {
  return (request, event) => {
    if (
      request.auth?.b2bToken &&
      (request.nextUrl.pathname.startsWith('/account/') ||
        request.nextUrl.pathname.startsWith('/login'))
    ) {
      return NextResponse.redirect(new URL('/?section=orders', request.url));
    }

    return next(request, event);
  };
};

declare module 'next/server' {
  interface NextRequest {
    auth: Session | null;
  }
}
