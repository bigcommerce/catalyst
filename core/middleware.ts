import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withChannelId } from './middlewares/with-channel-id';
import { withIntl } from './middlewares/with-intl';
import { withRoutes } from './middlewares/with-routes';

export const middleware = async (request :any, event:any) => {
  const { pathname, search } = request.nextUrl;
  const fullUrl = pathname + search;

  console.log(`Request started for URL: ${fullUrl}`);

  const start = Date.now(); // Start time

  const response = await composeMiddlewares(
    withAuth,
    withIntl,
    withChannelId,
    withRoutes,
  )(request, event);

  const end = Date.now(); // End time

  console.log(`Request completed for URL: ${fullUrl}`);
  console.log(`Execution time for middlewares: ${end - start}ms`);

  return response;
};

export const config = {
  matcher: [
    '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt).*)',
  ],
};
