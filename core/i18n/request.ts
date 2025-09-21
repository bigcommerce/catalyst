import deepmerge from 'deepmerge';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { locales } from './locales';

// The language to fall back to if the requested message string is not available.
const fallbackLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  if (locale === fallbackLocale) {
    return {
      locale,

      messages: (await import(`../messages/${locale}.json`)).default,
    };
  }

  return {
    locale,
    messages: deepmerge(
      (await import(`../messages/${fallbackLocale}.json`)).default,

      (await import(`../messages/${locale}.json`)).default,
    ),
  };
});
