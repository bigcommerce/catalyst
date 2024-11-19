import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { fallbackLocale, locales } from './routing';

import deepmerge from 'deepmerge';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    notFound();
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
