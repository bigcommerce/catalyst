/* eslint-disable check-file/folder-naming-convention */
/*
 * Robots.txt route
 *
 * This route pulls robots.txt content from the channel settings.
 *
 * If you would like to configure this in code instead, delete this file and follow this guide:
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 *
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { defaultLocale } from '~/i18n/routing';

const RobotsTxtQuery = graphql(`
  query RobotsTxt {
    site {
      settings {
        robotsTxt
      }
    }
  }
`);

function parseUrl(url?: string): URL {
  let incomingUrl = '';
  const defaultUrl = new URL('http://localhost:3000/');

  if (url && !url.startsWith('http')) {
    incomingUrl = `https://${url}`;
  }

  return new URL(incomingUrl || defaultUrl);
}

const baseUrl = parseUrl(
  process.env.NEXTAUTH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
);

export const GET = async () => {
  const { data } = await client.fetch({
    document: RobotsTxtQuery,
    channelId: getChannelIdFromLocale(defaultLocale),
    fetchOptions: { cache: 'no-store' }, // disable caching to get the latest robots.txt at build time
  });

  const robotsTxt = `${data.site.settings?.robotsTxt ?? ''}\nSitemap: ${baseUrl.origin}/sitemap.xml\n`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
};

export const dynamic = 'force-static';
