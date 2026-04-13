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
import { defaultLocale } from '~/i18n/locales';

const GetFaviconQuery = graphql(`
  query GetFaviconQuery {
    site {
      settings {
        faviconUrl
      }
    }
  }
`);

async function getFaviconData() {
  'use cache';

  const { data } = await client.fetch({
    document: GetFaviconQuery,
    channelId: getChannelIdFromLocale(defaultLocale),
  });

  const faviconUrl = data.site.settings?.faviconUrl;

  if (!faviconUrl) {
    return null;
  }

  const faviconBuffer = await fetch(faviconUrl).then((res) =>
    res.arrayBuffer().then((buf) => Buffer.from(buf).toString('base64')),
  );

  return faviconBuffer;
}

export const GET = async () => {
  const faviconData = await getFaviconData();

  if (!faviconData) {
    return new Response(null, { status: 404 });
  }

  return new Response(Buffer.from(faviconData, 'base64'), {
    headers: { 'Content-Type': 'image/x-icon' },
  });
};
