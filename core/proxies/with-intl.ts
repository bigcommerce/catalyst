import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { getLocaleRoutingForProxy, LOCALE_ROUTING_HEADER } from '~/i18n/locale-config';
import { createRouting, getLocalePrefix } from '~/i18n/locale-routing';

import { type ProxyFactory } from './compose-proxies';

export const withIntl: ProxyFactory = (next) => {
  return async (request, event) => {
    // Locale subfolders come from merchant configuration, so they are resolved per request rather
    // than baked in at build time. `createMiddleware` is a thin closure over the routing config —
    // all of its prefix matching already happens per invocation — so building it here is cheap.
    const localeRouting = await getLocaleRoutingForProxy(event);

    // Only reachable with a cold cache and BigCommerce unreachable. Without the locale
    // configuration the store's URL space is unknown, so there is no correct URL to serve. 503 says
    // "try again" — a 404 would tell crawlers these pages no longer exist.
    if (!localeRouting) {
      return new NextResponse('Service Unavailable', {
        status: 503,
        headers: { 'retry-after': '60' },
      });
    }

    const intlMiddleware = createMiddleware(createRouting(localeRouting));

    // Set before running the middleware, not after: next-intl copies the incoming request headers
    // onto its response as `x-middleware-request-*`, and that is the only mechanism by which a
    // header reaches the render — `withRoutes` rewrites without forwarding request headers, and the
    // header copy below would overwrite the override list anyway. This is how next-intl's own
    // locale header gets through. Always overwritten here, so it is never trusted from the client.
    request.headers.set(LOCALE_ROUTING_HEADER, JSON.stringify(localeRouting));

    const intlResponse = intlMiddleware(request);

    // If intlMiddleware redirects, or returns a non-200 return it immediately
    if (!intlResponse.ok) {
      return intlResponse;
    }

    // Extract locale from intlMiddleware response
    const locale = intlResponse.headers.get('x-middleware-request-x-next-intl-locale') ?? '';

    request.headers.set('x-bc-locale', locale);
    // The prefix next-intl matched for this locale. Route resolution downstream has to strip
    // exactly this much off the pathname, and it can't recompute it from build-time config.
    // Empty when the locale is served unprefixed at "/".
    request.headers.set('x-bc-locale-prefix', locale ? getLocalePrefix(localeRouting, locale) : '');

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
