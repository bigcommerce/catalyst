/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;
const canonicalDomain: string = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

const remoteSitemapUrl = `https://store-${storeHash}-${channelId}.${canonicalDomain}/xmlsitemap.php`;

export const GET = async () => fetch(remoteSitemapUrl);

export const runtime = 'edge';
