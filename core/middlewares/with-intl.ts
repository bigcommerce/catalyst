import createMiddleware from 'next-intl/middleware';

import { routing } from '~/i18n/routing';
import { isServerAction } from '~/lib/server-actions';

import { type MiddlewareFactory } from './compose-middlewares';

const intlMiddleware = createMiddleware(routing);

export const withIntl: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const intlResponse = intlMiddleware(request);

    // If intlMiddleware redirects, or returns a non-200 return it immediately
    if (!intlResponse.ok) {
      return intlResponse;
    }

    // Extract locale from intlMiddleware response
    const locale = intlResponse.headers.get('x-middleware-request-x-next-intl-locale') ?? '';

    request.headers.set('x-bc-locale', locale);

    // Continue the middleware chain
    const response = await next(request, event);

    // Copy headers from intlResponse to response, excluding 'x-middleware-rewrite'
    // If the request is a server action, also exclude `NEXT_LOCALE` cookie headers to avoid
    // triggering an [unnecessary page rerender](https://github.com/vercel/next.js/issues/50163)
    const serverAction = isServerAction(request);
    intlResponse.headers.forEach((v, k) => {
      if (k !== 'x-middleware-rewrite' && (!serverAction || !isSetNextLocaleCookie(k, v))) {
        response?.headers.set(k, v);
      }
    });

    return response;
  };
};

const isSetNextLocaleCookie = (k: string, v: string) =>
  (k == 'set-cookie' || k == 'x-middleware-set-cookie') && v.startsWith('NEXT_LOCALE=');