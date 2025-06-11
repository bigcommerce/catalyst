import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withAnalyticsCookies } from './middlewares/with-analytics-cookies';
import { withAuth } from './middlewares/with-auth';
import { withB2B } from './middlewares/with-b2b';
import { withChannelId } from './middlewares/with-channel-id';
import { withIntl } from './middlewares/with-intl';
import { withRoutes } from './middlewares/with-routes';

export const middleware = composeMiddlewares(
  withAuth,
  withIntl,
  withAnalyticsCookies,
  withChannelId,
  withB2B,
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
    '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt).*)',
  ],
};
