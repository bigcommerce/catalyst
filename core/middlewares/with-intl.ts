import createMiddleware from 'next-intl/middleware';

import { defaultLocale, localePrefix, locales } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

export const withIntl: MiddlewareFactory = () => {
  return (request) => {
    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale,
      localeDetection: true,
    });

    return intlMiddleware(request);
  };
};
