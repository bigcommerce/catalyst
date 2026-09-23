/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';

export const GET = async () => {
  // Outside the proxy, so there is no request locale: a bare call resolves the default channel.
  const sitemapIndex = await client.fetchSitemapIndex(getChannelIdFromLocale());

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
