import { buildConfig } from '~/build-config/reader';

const localeNodes = buildConfig.get('locales');

export const locales = localeNodes.map((locale) => locale.code);

const defaultNode = localeNodes.find((locale) => locale.isDefault);

export const defaultLocale = defaultNode?.code ?? 'en';

// A locale's path is "empty" (wants root, no prefix) when it's null or "".
const isEmptyPath = (path: string | null) => path === null || path === '';

// Only one locale can serve at the root (`/`). The default locale wins; if the default
// has a custom path, the first non-default with an empty path takes the root.
const rootLocale: string | undefined = (() => {
  if (defaultNode && isEmptyPath(defaultNode.path)) return defaultNode.code;

  return localeNodes.find((locale) => !locale.isDefault && isEmptyPath(locale.path))?.code;
})();

// True when the merchant has configured at least one non-empty custom subfolder.
export const hasCustomSubfolders = localeNodes.some(
  (locale) => locale.path !== null && locale.path !== '',
);

// Prefix map for every locale that is NOT at the root. Locales with a non-empty `path`
// use that path; everyone else falls back to `/${code}`.
export const prefixes = localeNodes.reduce<Record<string, `/${string}`>>((acc, locale) => {
  if (locale.code === rootLocale) return acc;

  acc[locale.code] = locale.path ? `/${locale.path}` : `/${locale.code}`;

  return acc;
}, {});

// next-intl couples the "no-prefix" URL slot to its `defaultLocale` in `as-needed` mode.
// When the merchant put a non-default locale at the root, route under that locale here
// while keeping `defaultLocale` (above) as the CP-configured default for content/fallback.
export const routingDefaultLocale = rootLocale ?? defaultLocale;

export const hasRootLocale = rootLocale !== undefined;
