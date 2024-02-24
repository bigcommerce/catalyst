import { cookies } from 'next/headers';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { StorefrontStatusType } from '~/client/generated/graphql';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';
import { routeCacheKvKey, STORE_STATUS_KEY } from '~/lib/kv/keys';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

type Node = Awaited<ReturnType<typeof getRoute>>;

interface RouteCache {
  node: Node;
  expiryTime: number;
}

interface StorefrontStatusCache {
  status: StorefrontStatusType;
  expiryTime: number;
}

const createRewriteUrl = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);

  url.search = request.nextUrl.search;

  return url;
};

const StorefrontStatusCacheSchema = z.object({
  status: z.nativeEnum(StorefrontStatusType),
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
]);

const RouteSchema = z.object({
  redirect: z.nullable(RedirectSchema),
  node: z.nullable(NodeSchema),
});

const RouteCacheSchema = z.object({
  route: z.nullable(RouteSchema),
  expiryTime: z.number(),
});

const getExistingRouteInfo = async (request: NextRequest, event: NextFetchEvent) => {
  try {
    const pathname = request.nextUrl.pathname;

    const [routeCache, statusCache] = await kv.mget<RouteCache | StorefrontStatusCache>(
      routeCacheKvKey(pathname),
      STORE_STATUS_KEY,
    );

    if (statusCache && statusCache.expiryTime < Date.now()) {
      // Hit the revalidate route to update the cache,
      // but use event.waitUntil to avoid holding up the page load
      event.waitUntil(
        fetch(new URL(`/api/revalidate/store-status`, request.url), {
          method: 'POST',
          headers: {
            'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
          },
        }),
      );
    }

    if (routeCache && routeCache.expiryTime < Date.now()) {
      // Hit the revalidate API to update the cache,
      // but use event.waitUntil to avoid holding up the page load
      event.waitUntil(
        fetch(new URL(`/api/revalidate/route`, request.url), {
          method: 'POST',
          body: JSON.stringify({ pathname }),
          headers: {
            'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
          },
        }),
      );
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

const setKvStatus = async (status?: StorefrontStatusType | null) => {
  try {
    const expiryTime = Date.now() + 1000 * 60 * 5; // 5 minutes;

    await kv.set(STORE_STATUS_KEY, { status, expiryTime });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setKvRoute = async (request: NextRequest, route: z.infer<typeof RouteSchema>) => {
  try {
    const expiryTime = Date.now() + 1000 * 60 * 30; // 30 minutes;

    await kv.set(routeCacheKvKey(request.nextUrl.pathname), { route, expiryTime });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const getRouteInfo = async (request: NextRequest, event: NextFetchEvent) => {
  try {
    let { status, route } = await getExistingRouteInfo(request, event);

    if (status === undefined) {
      const newStatus = await getStoreStatus();

      if (newStatus) {
        status = newStatus;
        // Allow the middleware to proceed without waiting for KV write
        event.waitUntil(setKvStatus(status));
      }
    }

    if (route === undefined) {
      const newRoute = await getRoute(request.nextUrl.pathname);

      const parsedNewRoute = RouteSchema.safeParse(newRoute);

      if (parsedNewRoute.success) {
        route = parsedNewRoute.data;

        // Allow the middleware to proceed without waiting for KV write
        event.waitUntil(setKvRoute(request, route));
      }
    }

    return { route, status };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      route: undefined,
      status: undefined,
    };
  }
};

export const withRoutes: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const { route, status } = await getRouteInfo(request, event);

    if (status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/maintenance`, request.url), { status: 503 });
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

    switch (node?.__typename) {
      case 'Brand': {
        const url = createRewriteUrl(`/brand/${node.entityId}${postfix}`, request);

        return NextResponse.rewrite(url);
      }

      case 'Category': {
        const url = createRewriteUrl(`/category/${node.entityId}${postfix}`, request);

        return NextResponse.rewrite(url);
      }

      case 'Product': {
        const url = createRewriteUrl(`/product/${node.entityId}${postfix}`, request);

        return NextResponse.rewrite(url);
      }

      default: {
        const { pathname } = new URL(request.url);

        if (pathname === '/' && postfix) {
          const url = createRewriteUrl(postfix, request);

          return NextResponse.rewrite(url);
        }

        return next(request, event);
      }
    }
  };
};
