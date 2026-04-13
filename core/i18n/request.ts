import deepmerge from 'deepmerge';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { locales } from './locales';

// The language to fall back to if the requested message string is not available.
const fallbackLocale = 'en';

export default getRequestConfig(async ({ locale: inputLocale }) => {
  // When locale is not provided, resolve from root-params.
  // rootParams.locale() reads from the URL path, not headers(),
  // so it's safe inside 'use cache' and cacheComponents.
  let locale = inputLocale;

  if (!locale) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const paramValue = await rootParams.locale();

    if (hasLocale(locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound();
    }
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
