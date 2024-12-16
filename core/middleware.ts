import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withChannelId } from './middlewares/with-channel-id';
import { withCustomerLoginAPI } from './middlewares/with-customer-login-api';
import { withIntl } from './middlewares/with-intl';
import { withRoutes } from './middlewares/with-routes';

// Split the middleware into two parts
const mainMiddleware = composeMiddlewares(
  withAuth,
  withIntl,
  withChannelId,
  withRoutes,
);

const customerLoginMiddleware = composeMiddlewares(withCustomerLoginAPI);

export function middleware(request: NextRequest, event: NextFetchEvent) {
  // Handle customer login API routes
  if (request.nextUrl.pathname.startsWith('/login/token/')) {
    return customerLoginMiddleware(request, event);
  }

  // Handle all other routes
  return mainMiddleware(request, event);
}

export const config = {
  matcher: [
    // Customer Login API routes
    '/login/token/:token*',
    // All other routes (excluding the ones we don't want to process)
    '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt).*)',
  ],
};
