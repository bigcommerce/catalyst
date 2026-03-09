import createMiddleware from 'next-intl/middleware';

import { routing } from '~/i18n/routing';

import { type ProxyFactory } from './compose-proxies';

const intlMiddleware = createMiddleware(routing);

export const withIntl: ProxyFactory = (next) => {
  return async (request, event) => {
    const intlResponse = intlMiddleware(request);

    // If intlMiddleware redirects, or returns a non-200 return it immediately
    if (!intlResponse.ok) {
      return intlResponse;
    }

    // Extract locale from intlMiddleware response
    const locale = intlResponse.headers.get('x-middleware-request-x-next-intl-locale') ?? '';

    request.headers.set('x-bc-locale', locale);

    // Continue the proxy chain
    const response = await next(request, event);

    // Copy headers from intlResponse to response, excluding 'x-middleware-rewrite'
    intlResponse.headers.forEach((v, k) => {
      if (k !== 'x-middleware-rewrite') {
        response?.headers.set(k, v);
      }
    });

    return response;
  };
};
