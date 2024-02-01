import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, localePrefix, LocalePrefixes, locales, LocaleType } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

// we use negotiator and intl-localematcher to get best locale
const getLocale = (request: NextRequest): LocaleType | undefined => {
  const negotiatorHeaders: Record<string, string> = {};

  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const supportedLocales = locales as unknown as string[];
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(supportedLocales);
  const locale = matchLocale(languages, supportedLocales, defaultLocale);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return locale as LocaleType;
};

const updateLocaleCookie = (currentLocale: string, request: NextRequest) => {
  const nextLocale = cookies().get('NEXT_LOCALE')?.value;

  if (localePrefix === LocalePrefixes.NEVER && nextLocale !== currentLocale) {
    request.cookies.set('NEXT_LOCALE', currentLocale);
  }
};

export const withI18n: MiddlewareFactory = () => {
  return (request: NextRequest) => {
    const locale = getLocale(request) ?? defaultLocale;

    updateLocaleCookie(locale, request);

    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale: locale,
    });
    const response = intlMiddleware(request);

    response.cookies.set('NEXT_LOCALE', locale);

    return response;
  };
};
