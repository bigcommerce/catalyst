import deepmerge from 'deepmerge';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { locales } from './routing';

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      messages: (await import(`../messages/${locale}.json`)).default,
    };
  }

  return {
    locale,
    messages: deepmerge(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      (await import(`../messages/${fallbackLocale}.json`)).default,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      (await import(`../messages/${locale}.json`)).default,
    ),
  };
});
