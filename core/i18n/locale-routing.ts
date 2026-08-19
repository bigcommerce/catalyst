import { defineRouting } from 'next-intl/routing';

// A locale as configured in the BigCommerce control panel. `path` is the subfolder segment (e.g.
// `fr-fr`); both `''` and `null` mean "no subfolder".
export interface LocaleNode {
  code: string;
  isDefault: boolean;
  path: string | null;
}

// Maps between locales and URLs in both directions. Merchant configuration, so treat it as
// request-scoped rather than a module constant — see `~/i18n/locale-config`.
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
 * Normalizes a control-panel subfolder so `fr-fr`, `fr-fr/` and `/fr-fr` are equivalent.
 *
 * @param {string | null} path - The raw `path` from BigCommerce.
 * @returns {string} The bare subfolder, empty when the locale has none.
 */
export function normalizeLocalePath(path: string | null): string {
  return (path ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

// Which locale occupies the bare "/": the default locale if it has no subfolder, else the sole
// non-default locale without one, else none (every locale gets a prefix).
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
 * @param {LocaleNode[]} localeNodes - Locales as configured in the control panel.
 * @returns {LocaleRouting} Codes, prefixes and the locale (if any) served at "/".
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
 * Builds a next-intl routing config. `rootLocale` becomes next-intl's `defaultLocale` so "/"
 * resolves; when no locale sits at "/", every locale needs a prefix, hence `always` mode.
 *
 * @param {LocaleRouting} localeRouting - Locale routing from merchant configuration.
 * @returns {object} Config for `createMiddleware` or `createNavigation`.
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
 * The prefix next-intl uses for `locale`, mirroring its internal `getLocalePrefix`. Keep in sync
 * with `createRouting`: the proxy passes this to `withRoutes`, which strips exactly what
 * next-intl matched.
 *
 * @param {LocaleRouting} localeRouting - Locale routing from merchant configuration.
 * @param {string} locale - The locale code to resolve.
 * @returns {string} The prefix, empty when the locale is served at "/".
 */
export function getLocalePrefix(localeRouting: LocaleRouting, locale: string): string {
  if (locale === localeRouting.rootLocale) return '';

  return localeRouting.prefixes[locale] ?? `/${locale}`;
}
