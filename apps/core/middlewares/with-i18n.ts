import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, localePrefix, locales, LocaleType } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

const getLocale = (request: NextRequest): LocaleType | undefined => {
  const negotiatorHeaders: Record<string, string> = {};

  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const supportedLocales = locales as unknown as string[];

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(supportedLocales);

  const locale = matchLocale(languages, supportedLocales, defaultLocale);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return locale as LocaleType;
};

export const withI18n: MiddlewareFactory = () => {
  return (request: NextRequest) => {
    const locale = getLocale(request) ?? defaultLocale;

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
