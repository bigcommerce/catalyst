import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { locales, LocaleType } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (!locales.includes(locale as LocaleType)) {
    notFound();
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
