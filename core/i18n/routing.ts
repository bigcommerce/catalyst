import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { defaultLocale, hasRootLocale, locales, prefixes, routingDefaultLocale } from './locales';

export { defaultLocale };

enum LocalePrefixes {
  ALWAYS = 'always',
  // Don't use NEVER as there is an issue that causes cache problems and returns the wrong messages.
  // More info: https://github.com/amannn/next-intl/issues/786
  // NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

// When a locale claims the root URL (either the CP default with empty/null path, or a
// non-default with an explicit empty path), use `as-needed` mode under that locale so
// it serves at `/`. Otherwise every locale gets an explicit prefix.
const localePrefix = hasRootLocale
  ? { mode: LocalePrefixes.ASNEEDED, prefixes }
  : { mode: LocalePrefixes.ALWAYS, prefixes };

export const routing = defineRouting({
  locales,
  defaultLocale: routingDefaultLocale,
  localePrefix,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
// Redirect will append locale prefix even when in default locale
// More info: https://github.com/amannn/next-intl/issues/1335
export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing);
