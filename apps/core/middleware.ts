import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withCustomUrls } from './middlewares/with-custom-urls';
import { withI18n } from './middlewares/with-i18n';
import { withMaintenanceMode } from './middlewares/with-maintenance-mode';

export const middleware = composeMiddlewares(
  withMaintenanceMode,
  withAuth,
  withCustomUrls,
  withI18n,
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
     */
    '/((?!api|_next/static|_next/image|_vercel|favicon.ico).*)',
    '/',
    '/(de|en)/(.*)',
  ],
};
