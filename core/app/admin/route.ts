import { useLocale } from 'next-intl';

import { redirect } from '~/i18n/routing';

const canonicalDomain: string = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const ENABLE_ADMIN_ROUTE = process.env.ENABLE_ADMIN_ROUTE;

export const GET = () => {
  const locale = useLocale();

  // This route should not work unless explicitly enabled
  if (ENABLE_ADMIN_ROUTE !== 'true') {
    return redirect({ href: '/', locale });
  }

  return redirect({
    href: BIGCOMMERCE_STORE_HASH
      ? `https://store-${BIGCOMMERCE_STORE_HASH}.${canonicalDomain}/admin`
      : 'https://login.bigcommerce.com',
    locale,
  });
};

export const runtime = 'edge';
