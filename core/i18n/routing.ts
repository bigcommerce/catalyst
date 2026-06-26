import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales, prefixes, rootLocale } from './locales';

enum LocalePrefixes {
  ALWAYS = 'always',
  // Don't use NEVER as there is an issue that causes cache problems and returns the wrong messages.
  // More info: https://github.com/amannn/next-intl/issues/786
  // NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

// `rootLocale` is the locale (if any) that occupies the bare "/" URL. We hand it
// to next-intl as the routing default so URLs like "/" resolve correctly. When no
// locale lives at "/", every locale needs a prefix, so we use `always` mode and
// fall back to the BC default for next-intl's defaultLocale.
const localePrefix =
  rootLocale === null
    ? { mode: LocalePrefixes.ALWAYS, prefixes }
    : { mode: LocalePrefixes.ASNEEDED, prefixes };

export const routing = defineRouting({
  locales,
  defaultLocale: rootLocale ?? defaultLocale,
  localePrefix,
  // configure `NEXT_LOCALE` cookie to work inside of the Makeswift Builder's canvas
  localeCookie: {
    partitioned: true,
    secure: true,
    sameSite: 'none',
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
// Redirect will append locale prefix even when in default locale
// More info: https://github.com/amannn/next-intl/issues/1335
export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing);
