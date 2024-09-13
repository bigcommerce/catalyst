/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the store's favicon URL
 *
 * If you would prefer to put a favicon image directly in your codebase,
 * delete this route folder and follow this guide:
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
 *
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { defaultLocale } from '~/i18n/routing';

const GetFaviconQuery = graphql(`
  query GetFavicon {
    site {
      settings {
        faviconUrl
      }
    }
  }
`);

export const GET = async () => {
  const { data } = await client.fetch({
    document: GetFaviconQuery,
    channelId: getChannelIdFromLocale(defaultLocale),
  });

  const faviconUrl = data.site.settings?.faviconUrl;

  if (!faviconUrl) {
    return new Response(null, {
      status: 404,
    });
  }

  // fetch the favicon URL and return the data directly (will be statically cached at build time)
  const faviconData = await fetch(faviconUrl).then((res) => res.arrayBuffer());

  return new Response(faviconData, {
    headers: {
      'Content-Type': 'image/x-icon',
    },
  });
};

export const dynamic = 'force-static';
