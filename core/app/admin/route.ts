// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { redirect } from 'next/navigation';

const canonicalDomain: string = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const ENABLE_ADMIN_ROUTE = process.env.ENABLE_ADMIN_ROUTE;

// Deliberately not the locale-aware redirect. This route is excluded from the proxy matcher, so it
// has no request locale: resolving one would mean an uncached GraphQL call on every hit to a route
// that is disabled by default. Redirecting to "/" is enough — the proxy applies the locale there.
export const GET = () => {
  // This route should not work unless explicitly enabled
  if (ENABLE_ADMIN_ROUTE !== 'true') {
    redirect('/');
  }

  redirect(
    BIGCOMMERCE_STORE_HASH
      ? `https://store-${BIGCOMMERCE_STORE_HASH}.${canonicalDomain}/admin`
      : 'https://login.bigcommerce.com',
  );
};
