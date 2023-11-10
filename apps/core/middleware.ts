import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withCustomUrls } from './middlewares/with-custom-urls';
import { withMaintenanceMode } from './middlewares/with-maintenance-mode';
// import { withSessionManagement } from './middlewares/with-session-management';

export const middleware = composeMiddlewares(
  withMaintenanceMode,
  withCustomUrls,
  // withSessionManagement,
);

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
