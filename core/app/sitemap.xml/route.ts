/* eslint-disable check-file/folder-naming-convention */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { defaultLocale } from '~/i18n/locales';
import { routing } from '~/i18n/routing';
import { client as makeswiftClient } from '~/lib/makeswift/client';

export function replaceSitemapUrls(xml: string, origin: string): string {
  return xml
    .replace(/<loc>(https?:\/\/[^/]+)([^<]*)<\/loc>/g, (_match, _oldOrigin, path) => {
      const fixed = `${origin}${path}`;

      return `<loc>${fixed}</loc>`;
    })
    .replace(/xmlsitemap\.php/g, 'sitemap.xml');
}

export function addHreflangAnnotations(xml: string, origin: string): string {
  const { locales } = routing;

  if (!xml.includes('<urlset')) {
    return xml;
  }

  const intlXml = xml.replace(
    /<urlset .+?>/,
    `<urlset
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>`,
  );

  const urlPattern = /<loc>([\s\S]*?)<\/loc>/g;

  return intlXml.replace(urlPattern, (_, urlContent: string) => {
    const urlObj = new URL(urlContent);
    const basePath = urlObj.pathname;

    const hreflangLinks = locales
      .map((locale) => {
        const localePath = locale === defaultLocale ? basePath : `/${locale}${basePath}`;
        const localeUrl = `${origin}${localePath}`;

        return `<xhtml:link rel="alternate" hreflang="${locale}" href="${localeUrl}" />`;
      })
      .join('\n');

    return `<loc>${urlContent}</loc>\n${hreflangLinks}`;
  });
}

export function addSitemapNode(xml: string, newLoc: string): string {
  const newSitemap = `
  <sitemap>
    <loc>${newLoc.replace(/&/g, '&amp;')}</loc>
  </sitemap>`;

  return xml.replace('</sitemapindex>', `${newSitemap}\n</sitemapindex>`);
}

export async function getIndexSitemap(origin: string): Promise<string> {
  const sitemapIndex = replaceSitemapUrls(
    await client.fetchSitemapIndex(getChannelIdFromLocale(defaultLocale)),
    origin,
  );

  return addSitemapNode(sitemapIndex, `${origin}/sitemap.xml?type=pages`);
}

const getCanonicalUrl = (): string => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  const channelId = getChannelIdFromLocale(defaultLocale);
  const graphqlApiDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

  return `https://store-${storeHash}-${channelId}.${graphqlApiDomain}`;
};

export async function getMappedSitemap(origin: string, request: Request): Promise<string> {
  const canonicalUrl = getCanonicalUrl();
  const sourceUrl = request.url
    .replace(origin, canonicalUrl)
    .replace('sitemap.xml', 'xmlsitemap.php');

  const sourceSitemap = await fetch(sourceUrl);
  const sourceSitemapText = await sourceSitemap.text();

  return addHreflangAnnotations(replaceSitemapUrls(sourceSitemapText, origin), origin);
}

export async function getPagesSitemap(origin: string): Promise<string> {
  const pages = await makeswiftClient.getPages();
  const pageNodes = pages.data.map((page) => {
    return `<url>
      <loc>${origin}${page.path}</loc>
      <lastmod>${page.updatedAt}</lastmod>
      <changefreq>weekly</changefreq>
    </url>`;
  });

  return `<urlset
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  >
${pageNodes.join('\n')}
  </urlset>`;
}

export function getSitemap(
  origin: string,
  type: string | undefined,
  request: Request,
): Promise<string> {
  switch (type) {
    case 'products':
    case 'categories':
      return getMappedSitemap(origin, request);

    case 'pages':
    case 'news':
      return getPagesSitemap(origin);

    default:
      return getIndexSitemap(origin);
  }
}

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const origin = url.origin;

  const type = url.searchParams.get('type');

  return new Response(await getSitemap(origin, type ?? '', request), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};

export const runtime = 'edge';
