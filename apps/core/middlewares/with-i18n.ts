import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, localePrefix, locales } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

export const withI18n: MiddlewareFactory = () => {
  return (request: NextRequest) => {
    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale,
    });
    const response = intlMiddleware(request);

    return response;
  };
};
