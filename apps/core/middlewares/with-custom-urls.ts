import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { StorefrontStatusType } from '~/client/generated/graphql';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

type Node = Awaited<ReturnType<typeof getRoute>>;

interface RouteCache {
  node: Node;
  expiryTime: number;
}

const STORE_STATUS_KEY = 'storeStatus';

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

const RouteCacheSchema = z.object({
  node: z.nullable(z.object({ __typename: z.string(), entityId: z.optional(z.number()) })),
  expiryTime: z.number(),
});

const getExistingRouteInfo = async (request: NextRequest) => {
  try {
    const pathname = request.nextUrl.pathname;

    const [routeCache, statusCache] = await kv.mget<RouteCache | StorefrontStatusCache>(
      pathname,
      STORE_STATUS_KEY,
    );

    if (statusCache && statusCache.expiryTime < Date.now()) {
      void fetch(new URL(`/api/revalidate/store-status`, request.url), {
        method: 'POST',
        headers: {
          'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
        },
      });
    }

    if (routeCache && routeCache.expiryTime < Date.now()) {
      void fetch(new URL(`/api/revalidate/route`, request.url), {
        method: 'POST',
        body: JSON.stringify({ pathname }),
        headers: {
          'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
        },
      });
    }

    const parsedRoute = RouteCacheSchema.safeParse(routeCache);
    const parsedStatus = StorefrontStatusCacheSchema.safeParse(statusCache);

    return {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      node: parsedRoute.success ? (parsedRoute.data.node as Node) : undefined,
      status: parsedStatus.success ? parsedStatus.data.status : undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      node: undefined,
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

const setKvRoute = async (request: NextRequest, node: Node) => {
  try {
    const expiryTime = Date.now() + 1000 * 60 * 30; // 30 minutes;

    await kv.set(request.nextUrl.pathname, { node, expiryTime });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const getRouteInfo = async (request: NextRequest) => {
  try {
    let { node, status } = await getExistingRouteInfo(request);

    if (status === undefined) {
      const newStatus = await getStoreStatus();

      if (newStatus) {
        status = newStatus;
        await setKvStatus(status);
      }
    }

    if (node === undefined) {
      const newNode = await getRoute(request.nextUrl.pathname);

      node = newNode;
      await setKvRoute(request, node);
    }

    return { node, status };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      node: undefined,
      status: undefined,
    };
  }
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const { node, status } = await getRouteInfo(request);

    if (status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/maintenance`, request.url), { status: 503 });
    }

    const customerId = await getSessionCustomerId();
    const cartId = cookies().get('cartId');
    let postfix = '';

    if (!request.nextUrl.search && !customerId && !cartId && request.method === 'GET') {
      postfix = '/static';
    }

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
