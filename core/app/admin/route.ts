// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { redirect } from 'next/navigation';

const canonicalDomain: string = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const ENABLE_ADMIN_ROUTE = process.env.ENABLE_ADMIN_ROUTE;

// Not the locale-aware redirect: this route is outside the proxy matcher, so resolving a locale
// would mean an uncached GraphQL call per hit. The proxy applies the locale on "/" anyway.
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
