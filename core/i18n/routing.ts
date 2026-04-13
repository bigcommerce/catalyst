import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from './locales';

enum LocalePrefixes {
  ALWAYS = 'always',
  // Don't use NEVER as there is a issue that causes cache problems and returns the wrong messages.
  // More info: https://github.com/amannn/next-intl/issues/786
  // NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

const localePrefix = LocalePrefixes.ASNEEDED;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});
