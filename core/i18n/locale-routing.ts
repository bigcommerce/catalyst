import { defineRouting } from 'next-intl/routing';

/**
 * A single locale as configured by the merchant in the BigCommerce control panel.
 *
 * `path` is the locale subfolder segment (e.g. `fr-fr`). The GraphQL schema types it as
 * non-nullable, so "no subfolder" arrives as an empty string, but `build-config.json`
 * allows `null` — both are treated as "no subfolder" below.
 */
export interface LocaleNode {
  code: string;
  isDefault: boolean;
  path: string | null;
}

/**
 * Everything needed to map between locales and URLs, in both directions.
 *
 * This is derived from merchant configuration, so it can change without a redeploy. Treat it as
 * request-scoped data rather than a module constant — see `~/i18n/locale-config`.
 */
export interface LocaleRouting {
  locales: string[];
  /** The locale BigCommerce marks as default. Not necessarily the one served at "/". */
  defaultLocale: string;
  /** Locale code -> subfolder prefix. Locales without a subfolder are absent. */
  prefixes: Record<string, `/${string}`>;
  /** The locale (if any) that occupies the bare root URL ("/"). */
  rootLocale: string | null;
}

/**
 * Trims whitespace and surrounding slashes from a control-panel subfolder value, so `fr-fr`,
 * `fr-fr/` and `/fr-fr` all describe the same prefix.
 *
 * @param {string | null} path - The raw `path` value from BigCommerce.
 * @returns {string} The bare subfolder, or an empty string when the locale has none.
 */
export function normalizeLocalePath(path: string | null): string {
  return (path ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

// The locale that should occupy the bare root URL ("/").
//
// Rule:
//   1. If the default locale has no CP path, default lives at "/".
//   2. Else, if exactly one non-default locale has no CP path, that one lives at "/".
//   3. Otherwise, no locale lives at "/" and every locale gets a prefix.
function computeRootLocale(
  localeNodes: readonly LocaleNode[],
  defaultLocaleNode: LocaleNode | undefined,
  defaultLocale: string,
): string | null {
  if (!defaultLocaleNode) return defaultLocale;
  if (!normalizeLocalePath(defaultLocaleNode.path)) return defaultLocaleNode.code;

  const blankNonDefaults = localeNodes.filter(
    (locale) => !locale.isDefault && !normalizeLocalePath(locale.path),
  );
  const [onlyBlank, ...rest] = blankNonDefaults;

  if (onlyBlank && rest.length === 0) return onlyBlank.code;

  return null;
}

/**
 * Pure projection of merchant locale configuration onto routing data.
 *
 * Shared by the build-time seed, the proxy and React Server Components so the three can't drift.
 *
 * @param {LocaleNode[]} localeNodes - Locales as configured in the BigCommerce control panel.
 * @returns {LocaleRouting} Locale codes, prefixes and the locale (if any) served at "/".
 */
export function deriveLocaleRouting(localeNodes: readonly LocaleNode[]): LocaleRouting {
  const defaultLocaleNode = localeNodes.find((locale) => locale.isDefault);
  const defaultLocale = defaultLocaleNode?.code ?? 'en';

  const prefixes = localeNodes.reduce<Record<string, `/${string}`>>((acc, locale) => {
    const path = normalizeLocalePath(locale.path);

    if (path) acc[locale.code] = `/${path}`;

    return acc;
  }, {});

  return {
    locales: localeNodes.map((locale) => locale.code),
    defaultLocale,
    prefixes,
    rootLocale: computeRootLocale(localeNodes, defaultLocaleNode, defaultLocale),
  };
}

enum LocalePrefixes {
  ALWAYS = 'always',
  // Don't use NEVER as there is an issue that causes cache problems and returns the wrong messages.
  // More info: https://github.com/amannn/next-intl/issues/786
  // NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

/**
 * Builds a next-intl routing config from merchant locale configuration.
 *
 * `rootLocale` is the locale (if any) that occupies the bare "/" URL. We hand it to next-intl as
 * the routing default so URLs like "/" resolve correctly. When no locale lives at "/", every
 * locale needs a prefix, so we use `always` mode and fall back to the BC default for next-intl's
 * defaultLocale.
 *
 * @param {LocaleRouting} localeRouting - Locale routing derived from merchant configuration.
 * @returns {object} A next-intl routing config for `createMiddleware` or `createNavigation`.
 */
export function createRouting(localeRouting: LocaleRouting) {
  const { locales, defaultLocale, prefixes, rootLocale } = localeRouting;

  const localePrefix =
    rootLocale === null
      ? { mode: LocalePrefixes.ALWAYS, prefixes }
      : { mode: LocalePrefixes.ASNEEDED, prefixes };

  return defineRouting({
    locales,
    defaultLocale: rootLocale ?? defaultLocale,
    localePrefix,
  });
}

/**
 * The URL prefix next-intl will use for `locale`, mirroring its internal `getLocalePrefix` plus
 * `as-needed` handling: an unprefixed root locale resolves to `''`, a locale with no configured
 * subfolder falls back to its bare code.
 *
 * Keep this in sync with `createRouting` — the proxy hands the result to `withRoutes` so route
 * resolution strips exactly what next-intl matched.
 *
 * @param {LocaleRouting} localeRouting - Locale routing derived from merchant configuration.
 * @param {string} locale - The locale code to resolve a prefix for.
 * @returns {string} The URL prefix, or an empty string when the locale is served at "/".
 */
export function getLocalePrefix(localeRouting: LocaleRouting, locale: string): string {
  if (locale === localeRouting.rootLocale) return '';

  return localeRouting.prefixes[locale] ?? `/${locale}`;
}
