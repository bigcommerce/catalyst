/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { createSitemapHandler } from '@bigcommerce/catalyst-sitemap';

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { defaultLocale } from '~/i18n/locales';

export const GET = createSitemapHandler({
  client,
  getChannelId: async () => {
    return getChannelIdFromLocale(defaultLocale);
  },
});
