/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { defaultLocale } from '~/i18n/locales';

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const incomingHost = request.headers.get('host') ?? url.host;
  const incomingProto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');

  const type = url.searchParams.get('type');
  const page = url.searchParams.get('page');

  // If a specific sitemap within the index is requested, require both params
  if (type !== null || page !== null) {
    if (!type || !page) {
      return new Response('Both "type" and "page" query params are required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const upstream = await client.fetchSitemapResponse(
      { type, page },
      getChannelIdFromLocale(defaultLocale),
    );

    // Pass-through upstream status/body but enforce XML content-type
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  // Otherwise, return the sitemap index with normalized internal links
  const sitemapIndex = await client.fetchSitemapIndex(getChannelIdFromLocale(defaultLocale));

  const rewritten = sitemapIndex.replace(
    /<loc>([^<]+)<\/loc>/g,
    (match: string, locUrlStr: string) => {
      try {
        // Decode XML entities for '&' so URL parsing works
        const decoded: string = locUrlStr.replace(/&amp;/g, '&');
        const original = new URL(decoded);

        if (!original.pathname.endsWith('/xmlsitemap.php')) {
          return match;
        }

        const normalized = new URL(`${incomingProto}://${incomingHost}/sitemap.xml`);

        const t = original.searchParams.get('type');
        const p = original.searchParams.get('page');

        // Only rewrite entries that include both type and page; otherwise leave untouched
        if (!t || !p) {
          return match;
        }

        normalized.searchParams.set('type', t);
        normalized.searchParams.set('page', p);

        // Re-encode '&' for XML output
        const normalizedXml: string = normalized.toString().replace(/&/g, '&amp;');

        return `<loc>${normalizedXml}</loc>`;
      } catch {
        return match;
      }
    },
  );

  return new Response(rewritten, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
