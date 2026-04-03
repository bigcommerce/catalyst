import { createNavigation } from 'next-intl/navigation';
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
