import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

enum LocalePrefixes {
  ALWAYS = 'always',
  NEVER = 'never',
  ASNEEDED = 'as-needed', // for removing prefix on default locale
}

const locales = ['en', 'de'] as const;

type LocalePrefixesType = `${LocalePrefixes}`;

// turn off prefix since we temporary give priority to accept-language header
// due to multi-language in Catalyst is in progress
const localePrefix: LocalePrefixesType = LocalePrefixes.NEVER;
const defaultLocale = 'en';

type LocaleType = (typeof locales)[number];

export default getRequestConfig(async (params) => {
  const { locale } = params;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (!locales.includes(locale as LocaleType)) notFound();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const isLocaleFound = locales.includes(locale as LocaleType);

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../core/dictionaries/${isLocaleFound ? locale : 'en'}.json`)).default,
  };
});

export { LocalePrefixes, locales, localePrefix, defaultLocale };
export type { LocaleType };
