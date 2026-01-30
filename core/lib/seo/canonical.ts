import { buildConfig } from '~/build-config/reader';
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
 */
export function getMetadataAlternates(options: CanonicalUrlOptions) {
  const { path, locale, includeAlternates = true } = options;

  const vanityUrl = buildConfig.get('urls').vanityUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const canonical = buildLocalizedUrl(vanityUrl, normalizedPath, locale);

  if (!includeAlternates) {
    return { canonical };
  }

  const languages: Record<string, string> = {};

  for (const loc of locales) {
    languages[loc] = buildLocalizedUrl(vanityUrl, normalizedPath, loc);
  }

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
