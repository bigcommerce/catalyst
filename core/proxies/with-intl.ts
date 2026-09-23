import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { getLocaleRoutingForProxy, LOCALE_ROUTING_HEADER } from '~/i18n/locale-config';
import { createRouting, getLocalePrefix } from '~/i18n/locale-routing';

import { type ProxyFactory } from './compose-proxies';

export const withIntl: ProxyFactory = (next) => {
  return async (request, event) => {
    // Resolved per request, not baked in at build time. `createMiddleware` is a thin closure over
    // the config — its prefix matching already runs per invocation — so building it here is cheap.
    const localeRouting = await getLocaleRoutingForProxy(event);

    // Cold cache and BigCommerce unreachable: the URL space is unknown, so there is no correct URL
    // to serve. 503 says "try again"; a 404 would tell crawlers these pages are gone.
    if (!localeRouting) {
      return new NextResponse('Service Unavailable', {
        status: 503,
        headers: { 'retry-after': '60' },
      });
    }

    // Makeswift's builder canvas pins the locale itself, so detection must not override it.
    const disableLocaleDetection = request.headers.get('x-bc-disable-locale-detection') === 'true';

    const intlMiddleware = createMiddleware({
      ...createRouting(localeRouting),
      ...(disableLocaleDetection ? { localeDetection: false } : {}),
    });

    // Must be set *before* the middleware runs: next-intl snapshots incoming request headers onto
    // its response as `x-middleware-request-*`, which is the only way a header reaches the render.
    // Always overwritten here, so it is never trusted from the client.
    request.headers.set(LOCALE_ROUTING_HEADER, JSON.stringify(localeRouting));

    const intlResponse = intlMiddleware(request);

    // If intlMiddleware redirects, or returns a non-200 return it immediately
    if (!intlResponse.ok) {
      return intlResponse;
    }

    // Extract locale from intlMiddleware response
    const locale = intlResponse.headers.get('x-middleware-request-x-next-intl-locale') ?? '';

    request.headers.set('x-bc-locale', locale);
    // The prefix next-intl matched, which `withRoutes` strips. Empty when served at "/".
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
