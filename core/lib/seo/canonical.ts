import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { defaultLocale, locales } from '~/i18n/locales';

interface CanonicalUrlOptions {
  /**
   * The path from BigCommerce (e.g., product.path, category.path)
   * or a manually constructed path for static pages (e.g., '/')
   */
  path: string;
  /**
   * Current locale from params
   */
  locale: string;
  /**
   * Whether to include hreflang alternates for all locales
   * @default true
   */
  includeAlternates?: boolean;
}

/**
 * Generates metadata alternates object for Next.js Metadata API
 *
 * Rules:
 * - Default locale: no prefix (e.g., https://example.com/product/)
 * - Other locales: with prefix (e.g., https://example.com/fr/product/)
 * - Respects TRAILING_SLASH environment variable
 *
 * @param {CanonicalUrlOptions} options - The options for generating canonical URLs
 * @returns {object} The metadata alternates object with canonical URL and optional language alternates
 */
const VanityUrlQuery = graphql(`
  query VanityUrlQuery {
    site {
      settings {
        url {
          vanityUrl
        }
      }
    }
  }
`);

const getVanityUrl = cache(async () => {
  const { data } = await client.fetch({
    document: VanityUrlQuery,
    fetchOptions: { next: { revalidate } },
  });

  const vanityUrl = data.site.settings?.url.vanityUrl;

  if (!vanityUrl) {
    throw new Error('Vanity URL not found in site settings');
  }

  return vanityUrl;
});

export async function getMetadataAlternates(options: CanonicalUrlOptions) {
  const { path, locale, includeAlternates = true } = options;

  // Use preview deployment URL so canonical/hreflang URLs point at the preview, not production.
  const previewUrl =
    process.env.VERCEL_ENV === 'preview' ? `https://${process.env.VERCEL_URL}` : undefined;
  const baseUrl = previewUrl && URL.canParse(previewUrl) ? previewUrl : await getVanityUrl();

  const canonical = buildLocalizedUrl(baseUrl, path, locale);

  if (!includeAlternates) {
    return { canonical };
  }

  const languages = locales.reduce<Record<string, string>>((acc, loc) => {
    acc[loc] = buildLocalizedUrl(baseUrl, path, loc);

    return acc;
  }, {});

  languages['x-default'] = buildLocalizedUrl(baseUrl, path, defaultLocale);

  return { canonical, languages };
}

function buildLocalizedUrl(baseUrl: string, pathname: string, locale: string): string {
  const trailingSlash = process.env.TRAILING_SLASH !== 'false';

  const url = new URL(pathname, baseUrl);

  url.pathname = locale === defaultLocale ? url.pathname : `/${locale}${url.pathname}`;

  if (trailingSlash && !url.pathname.endsWith('/')) {
    url.pathname += '/';
  } else if (!trailingSlash && url.pathname.endsWith('/') && url.pathname !== '/') {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.href;
}
