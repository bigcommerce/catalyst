import { composeMiddlewares, MiddlewareFactory } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withChannelId } from './middlewares/with-channel-id';
import { withIntl } from './middlewares/with-intl';
import { withMakeswift } from './middlewares/with-makeswift';
import { withRoutes } from './middlewares/with-routes';
import { NextMiddleware, NextResponse } from 'next/server';

// Custom middleware to rewrite /customer/current.jwt to /api/customer/current.jwt
const withCustomerJwtRewrite: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const url = request.nextUrl.clone();
    if (url.pathname === '/customer/current.jwt') {
      url.pathname = '/api/customer/current.jwt';
      return NextResponse.rewrite(url);
    }
    return next(request, event);
  };
};

import { withBlockInterFont } from './middlewares/with-block-inter-font';

export const middleware = composeMiddlewares(
  withBlockInterFont,
  withCustomerJwtRewrite,
  withAuth,
  withMakeswift,
  withIntl,
  withChannelId,
  withRoutes,
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (vercel internals, eg: web vitals)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     * - sitemap.xml (sitemap route)
     * - xmlsitemap.php (legacy sitemap route)
     * - robots.txt (robots route)
     */
    '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt|login/token).*)',
  ],
};
