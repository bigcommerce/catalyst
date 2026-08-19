/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';

export const GET = async () => {
  // Excluded from the proxy, so there is no request locale here. This only ever needs the store's
  // default channel, which is what a bare call resolves to.
  const sitemapIndex = await client.fetchSitemapIndex(getChannelIdFromLocale());

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
