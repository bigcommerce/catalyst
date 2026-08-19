import deepmerge from 'deepmerge';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { getForwardedLocaleRouting } from './locale-config';

// The language to fall back to if the requested message string is not available.
const fallbackLocale = 'en';

// A locale is only servable if a message file was bundled for it. Treating a missing file as "not
// found" rather than letting the import reject keeps an unrecognised locale a 404 instead of a 500,
// which also covers the case where no routing was forwarded to validate against.
const loadMessages = async (locale: string): Promise<Record<string, unknown>> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return (await import(`../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  // Header-only: resolving this by fetching would recurse back into this request config via
  // `client.fetch`. Requests that render a page always carry it, so the gate still applies.
  const localeRouting = await getForwardedLocaleRouting();

  if (!locale || (localeRouting && !localeRouting.locales.includes(locale))) {
    notFound();
  }

  if (locale === fallbackLocale) {
    return { locale, messages: await loadMessages(locale) };
  }

  return {
    locale,
    messages: deepmerge(await loadMessages(fallbackLocale), await loadMessages(locale)),
  };
});
