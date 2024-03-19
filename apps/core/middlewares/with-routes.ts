import { cookies } from 'next/headers';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { graphql } from '~/client/graphql';
import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';
import { routeCacheKvKey, STORE_STATUS_KEY } from '~/lib/kv/keys';

import { defaultLocale, localePrefix, LocalePrefixes, locales } from '../i18n';
import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

type Route = Awaited<ReturnType<typeof getRoute>>;
type StorefrontStatusType = ReturnType<typeof graphql.scalar<'StorefrontStatusType'>>;

interface RouteCache {
  route: Route;
  expiryTime: number;
}

interface StorefrontStatusCache {
  status: StorefrontStatusType;
  expiryTime: number;
}

const StorefrontStatusCacheSchema = z.object({
  status: z.union([
    z.literal('HIBERNATION'),
    z.literal('LAUNCHED'),
    z.literal('MAINTENANCE'),
    z.literal('PRE_LAUNCH'),
  ]),
  expiryTime: z.number(),
});

const RedirectSchema = z.object({
  __typename: z.string(),
  to: z.object({
    __typename: z.string(),
  }),
  toUrl: z.string(),
});

const NodeSchema = z.union([
  z.object({ __typename: z.literal('Product'), entityId: z.number() }),
  z.object({ __typename: z.literal('Category'), entityId: z.number() }),
  z.object({ __typename: z.literal('Brand'), entityId: z.number() }),
  z.object({ __typename: z.literal('RawHtmlPage'), id: z.string() }),
]);

const RouteSchema = z.object({
  redirect: z.nullable(RedirectSchema),
  node: z.nullable(NodeSchema),
});

const RouteCacheSchema = z.object({
  route: z.nullable(RouteSchema),
  expiryTime: z.number(),
});

const updateRouteCache = async (pathname: string, event: NextFetchEvent): Promise<RouteCache> => {
  const routeCache: RouteCache = {
    route: await getRoute(pathname),
    expiryTime: Date.now() + 1000 * 60 * 30, // 30 minutes
  };

  event.waitUntil(kv.set(routeCacheKvKey(pathname), routeCache));

  return routeCache;
};

const updateStatusCache = async (event: NextFetchEvent): Promise<StorefrontStatusCache> => {
  const status = await getStoreStatus();

  if (status === undefined) {
    throw new Error('Failed to fetch new storefront status');
  }

  const statusCache: StorefrontStatusCache = {
    status,
    expiryTime: Date.now() + 1000 * 60 * 5, // 5 minutes
  };

  event.waitUntil(kv.set(STORE_STATUS_KEY, statusCache));

  return statusCache;
};

let locale: string;
const clearLocaleFromPath = (path: string) => {
  let res: string;

  if (localePrefix === LocalePrefixes.ALWAYS) {
    res = locale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  if (localePrefix === LocalePrefixes.ASNEEDED) {
    res = locale && locale !== defaultLocale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  return path;
};

const getRouteInfo = async (request: NextRequest, event: NextFetchEvent) => {
  try {
    const pathname = clearLocaleFromPath(request.nextUrl.pathname);

    let [routeCache, statusCache] = await kv.mget<RouteCache | StorefrontStatusCache>(
      routeCacheKvKey(pathname),
      STORE_STATUS_KEY,
    );

    // If caches are old, update them in the background and return the old data (SWR-like behavior)
    // If cache is missing, update it and return the new data, but write to KV in the background
    if (statusCache && statusCache.expiryTime < Date.now()) {
      event.waitUntil(updateStatusCache(event));
    } else if (!statusCache) {
      statusCache = await updateStatusCache(event);
    }

    if (routeCache && routeCache.expiryTime < Date.now()) {
      event.waitUntil(updateRouteCache(pathname, event));
    } else if (!routeCache) {
      routeCache = await updateRouteCache(pathname, event);
    }

    const parsedRoute = RouteCacheSchema.safeParse(routeCache);
    const parsedStatus = StorefrontStatusCacheSchema.safeParse(statusCache);

    return {
      route: parsedRoute.success ? parsedRoute.data.route : undefined,
      status: parsedStatus.success ? parsedStatus.data.status : undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      route: undefined,
      status: undefined,
    };
  }
};

export const withRoutes: MiddlewareFactory = () => {
  return async (request, event) => {
    locale = cookies().get('NEXT_LOCALE')?.value || '';

    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale,
      localeDetection: true,
    });
    const response = intlMiddleware(request);

    // Early redirect to detected locale if needed
    if (response.redirected) {
      return response;
    }

    if (!locale) {
      // Try to get locale detected by next-intl
      locale = response.cookies.get('NEXT_LOCALE')?.value || '';
    }

    const { route, status } = await getRouteInfo(request, event);

    if (status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/${locale}/maintenance`, request.url), { status: 503 });
    }

    // Follow redirects if found on the route
    // Use 301 status code as it is more universally supported by crawlers
    const redirectConfig = { status: 301 };

    if (route?.redirect) {
      switch (route.redirect.to.__typename) {
        case 'ManualRedirect': {
          // For manual redirects, redirect to the full URL to handle cases
          // where the destination URL might be external to the site
          return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
        }

        default: {
          // For all other cases, assume an internal redirect and construct the URL
          // based on the current request URL to maintain internal redirection
          // in non-production environments
          const redirectPathname = new URL(route.redirect.toUrl).pathname;
          const redirectUrl = new URL(redirectPathname, request.url);

          return NextResponse.redirect(redirectUrl, redirectConfig);
        }
      }
    }

    const customerId = await getSessionCustomerId();
    const cartId = cookies().get('cartId');
    let postfix = '';

    if (!request.nextUrl.search && !customerId && !cartId && request.method === 'GET') {
      postfix = '/static';
    }

    const node = route?.node;
    let url: string;

    switch (node?.__typename) {
      case 'Brand': {
        url = `/${locale}/brand/${node.entityId}${postfix}`;
        break;
      }

      case 'Category': {
        url = `/${locale}/category/${node.entityId}${postfix}`;
        break;
      }

      case 'Product': {
        url = `/${locale}/product/${node.entityId}${postfix}`;
        break;
      }

      case 'RawHtmlPage': {
        const { htmlBody } = await getRawWebPageContent(node.id);

        return new NextResponse(htmlBody, {
          headers: { 'content-type': 'text/html' },
        });
      }

      default: {
        const { pathname } = new URL(request.url);
        const cleanPathName = clearLocaleFromPath(pathname);

        if (cleanPathName === '/' && postfix) {
          url = `/${locale}${postfix}`;
          break;
        }

        url = `/${locale}${cleanPathName}`;
      }
    }

    const rewriteUrl = new URL(url, request.url);

    rewriteUrl.search = request.nextUrl.search;

    const rewrite = NextResponse.rewrite(rewriteUrl);

    // Add rewrite header to response provided by next-intl
    rewrite.headers.forEach((v, k) => response.headers.set(k, v));

    return response;
  };
};
