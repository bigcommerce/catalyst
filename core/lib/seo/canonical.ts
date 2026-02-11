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

const getVanityUrl = cache(async (): Promise<string> => {
  const { data } = await client.fetch({
    document: VanityUrlQuery,
    fetchOptions: { next: { revalidate } },
  });

  const vanityUrl = data.site.settings?.url.vanityUrl;

  if (!vanityUrl) {
    throw new Error('Vanity URL not found in site settings');
  }

  return vanityUrl.replace(/\/$/, '');
});

export async function getMetadataAlternates(options: CanonicalUrlOptions) {
  const { path, locale, includeAlternates = true } = options;

  const vanityUrl = await getVanityUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const canonical = buildLocalizedUrl(vanityUrl, normalizedPath, locale);

  if (!includeAlternates) {
    return { canonical };
  }

  const languages = locales.reduce<Record<string, string>>((acc, loc) => {
    acc[loc] = buildLocalizedUrl(vanityUrl, normalizedPath, loc);

    return acc;
  }, {});

  languages['x-default'] = buildLocalizedUrl(vanityUrl, normalizedPath, defaultLocale);

  return { canonical, languages };
}

function buildLocalizedUrl(baseUrl: string, path: string, locale: string): string {
  const isDefault = locale === defaultLocale;
  const trailingSlash = process.env.TRAILING_SLASH !== 'false';

  let localizedPath = isDefault ? path : `/${locale}${path}`;

  if (trailingSlash && !localizedPath.endsWith('/')) {
    localizedPath = `${localizedPath}/`;
  } else if (!trailingSlash && localizedPath.endsWith('/') && localizedPath !== '/') {
    localizedPath = localizedPath.slice(0, -1);
  }

  return `${baseUrl}${localizedPath}`;
}
