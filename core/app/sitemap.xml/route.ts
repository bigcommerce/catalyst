/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { defaultLocale } from '~/i18n/routing';

export const GET = async () => {
  const sitemapIndex = await client.fetchSitemapIndex(getChannelIdFromLocale(defaultLocale));

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};

export const runtime = 'edge';
