const canonicalDomain: string = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;

// This route helps BigCommerce support identify your storefront; you may delete it if you wish,
// but doing so will make it harder for BigCommerce support to help you efficiently.

export const GET = () => {
  return fetch(`https://store-${BIGCOMMERCE_STORE_HASH}.${canonicalDomain}/admin/oauth/info`);
};

export const runtime = 'edge';
