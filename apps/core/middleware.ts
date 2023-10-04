import { NextResponse } from 'next/server';

import client from './client';
import { composeMiddlewares, type MiddlewareFactory } from './utils/composeMiddlewares';

const withMaintenanceMode: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const settings = await client.getStoreSettings();

    if (settings?.status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/maintenance`, request.url), { status: 503 });
    }

    return next(request, event);
  };
};

export const middleware = composeMiddlewares(withMaintenanceMode);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/',
  ],
};
