import { buildConfig } from '~/build-config/reader';

const localeNodes = buildConfig.get('locales');
const defaultLocaleNode = localeNodes.find((locale) => locale.isDefault);

export const locales = localeNodes.map((locale) => locale.code);
export const defaultLocale = defaultLocaleNode?.code ?? 'en';

export const prefixes = localeNodes.reduce<Record<string, `/${string}`>>((acc, locale) => {
  if (locale.path) acc[locale.code] = `/${locale.path}`;

  return acc;
}, {});

// The locale that should occupy the bare root URL ("/").
//
// Rule:
//   1. If the default locale has no CP path, default lives at "/".
//   2. Else, if exactly one non-default locale has no CP path, that one lives at "/".
//   3. Otherwise, no locale lives at "/" and every locale gets a prefix.
function computeRootLocale(): string | null {
  if (!defaultLocaleNode) return defaultLocale;
  if (!defaultLocaleNode.path) return defaultLocaleNode.code;

  const blankNonDefaults = localeNodes.filter((locale) => !locale.isDefault && !locale.path);
  const [onlyBlank, ...rest] = blankNonDefaults;

  if (onlyBlank && rest.length === 0) return onlyBlank.code;

  return null;
}

export const rootLocale = computeRootLocale();
