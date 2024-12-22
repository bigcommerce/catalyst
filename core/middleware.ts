import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withChannelId } from './middlewares/with-channel-id';
import { withIntl } from './middlewares/with-intl';
import { withRoutes } from './middlewares/with-routes';

export const middleware = composeMiddlewares(withAuth, withIntl, withChannelId, withRoutes);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (vercel internals)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     * - sitemap.xml (sitemap route)
     * - xmlsitemap.php (legacy sitemap route)
     * - robots.txt (robots route)
     * - login/token
     * - session-sync
     */
    '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt|login/token|session-sync).*)',
  ],
};
