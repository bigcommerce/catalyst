/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { client } from '~/client';

export const GET = async () => {
  const sitemapIndex = await client.fetchSitemapIndex();

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};

export const runtime = 'edge';
