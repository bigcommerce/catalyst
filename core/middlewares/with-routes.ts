import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { kvKey, STORE_STATUS_KEY } from '~/lib/kv/keys';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

const GetRouteQuery = graphql(`
  query getRoute($path: String!) {
    site {
      route(path: $path, redirectBehavior: FOLLOW) {
        redirect {
          to {
            __typename
            ... on BlogPostRedirect {
              path
            }
            ... on BrandRedirect {
              path
            }
            ... on CategoryRedirect {
              path
            }
            ... on PageRedirect {
              path
            }
            ... on ProductRedirect {
              path
            }
          }
          toUrl
        }
        node {
          __typename
          id
          ... on Product {
            entityId
          }
          ... on Category {
            entityId
          }
          ... on Brand {
            entityId
          }
        }
      }
    }
  }
`);

const getRoute = async (path: string, channelId?: string) => {
  const response = await client.fetch({
    document: GetRouteQuery,
    variables: { path },
    fetchOptions: { next: { revalidate } },
    channelId,
  });

  return response.data.site.route;
};

const getRawWebPageContentQuery = graphql(`
  query getRawWebPageContent($id: ID!) {
    node(id: $id) {
      __typename
      ... on RawHtmlPage {
        htmlBody
      }
    }
  }
`);

const getRawWebPageContent = async (id: string) => {
  const response = await client.fetch({
    document: getRawWebPageContentQuery,
    variables: { id },
  });

  const node = response.data.node;

  if (node?.__typename !== 'RawHtmlPage') {
    throw new Error('Failed to fetch raw web page content');
  }

  return node;
};

const GetStoreStatusQuery = graphql(`
  query getStoreStatus {
    site {
      settings {
        status
      }
    }
  }
`);

const getStoreStatus = async (channelId?: string) => {
  const { data } = await client.fetch({
    document: GetStoreStatusQuery,
    fetchOptions: { next: { revalidate: 300 } },
    channelId,
  });

  return data.site.settings?.status;
};

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
  to: z.union([
    z.object({ __typename: z.literal('BlogPostRedirect'), path: z.string() }),
    z.object({ __typename: z.literal('BrandRedirect'), path: z.string() }),
    z.object({ __typename: z.literal('CategoryRedirect'), path: z.string() }),
    z.object({ __typename: z.literal('PageRedirect'), path: z.string() }),
    z.object({ __typename: z.literal('ProductRedirect'), path: z.string() }),
    z.object({ __typename: z.literal('ManualRedirect') }),
  ]),
  toUrl: z.string(),
});

const NodeSchema = z.union([
  z.object({ __typename: z.literal('Product'), entityId: z.number() }),
  z.object({ __typename: z.literal('Category'), entityId: z.number() }),
  z.object({ __typename: z.literal('Brand'), entityId: z.number() }),
  z.object({ __typename: z.literal('ContactPage'), id: z.string() }),
  z.object({ __typename: z.literal('NormalPage'), id: z.string() }),
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

const updateRouteCache = async (
  pathname: string,
  channelId: string,
  event: NextFetchEvent,
): Promise<RouteCache> => {
  const routeCache: RouteCache = {
    route: await getRoute(pathname, channelId),
    expiryTime: Date.now() + 1000 * 60 * 30, // 30 minutes
  };

  event.waitUntil(kv.set(kvKey(pathname, channelId), routeCache));

  return routeCache;
};

const updateStatusCache = async (
  channelId: string,
  event: NextFetchEvent,
): Promise<StorefrontStatusCache> => {
  const status = await getStoreStatus(channelId);

  if (status === undefined) {
    throw new Error('Failed to fetch new storefront status');
  }

  const statusCache: StorefrontStatusCache = {
    status,
    expiryTime: Date.now() + 1000 * 60 * 5, // 5 minutes
  };

  event.waitUntil(kv.set(kvKey(STORE_STATUS_KEY, channelId), statusCache));

  return statusCache;
};

const clearLocaleFromPath = (path: string, locale: string) => {
  if (path.startsWith(`/${locale}/`)) {
    return path.replace(`/${locale}`, '');
  }

  return path;
};

const getRouteInfo = async (request: NextRequest, event: NextFetchEvent) => {
  const locale = request.headers.get('x-bc-locale') ?? '';
  const channelId = request.headers.get('x-bc-channel-id') ?? '';

  try {
    const pathname = clearLocaleFromPath(request.nextUrl.pathname, locale);

    let [routeCache, statusCache] = await kv.mget<RouteCache | StorefrontStatusCache>(
      kvKey(pathname, channelId),
      kvKey(STORE_STATUS_KEY, channelId),
    );

    // If caches are old, update them in the background and return the old data (SWR-like behavior)
    // If cache is missing, update it and return the new data, but write to KV in the background
    if (statusCache && statusCache.expiryTime < Date.now()) {
      event.waitUntil(updateStatusCache(channelId, event));
    } else if (!statusCache) {
      statusCache = await updateStatusCache(channelId, event);
    }

    if (routeCache && routeCache.expiryTime < Date.now()) {
      event.waitUntil(updateRouteCache(pathname, channelId, event));
    } else if (!routeCache) {
      routeCache = await updateRouteCache(pathname, channelId, event);
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
    const locale = request.headers.get('x-bc-locale') ?? '';

    const { route, status } = await getRouteInfo(request, event);

    if (status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/${locale}/maintenance`, request.url), { status: 503 });
    }

    const redirectConfig = {
      // Use 301 status code as it is more universally supported by crawlers
      status: 301,
      nextConfig: {
        // Preserve the trailing slash if it was present in the original URL
        // BigCommerce by default returns the trailing slash.
        trailingSlash: process.env.TRAILING_SLASH !== 'false',
      },
    };

    if (route?.redirect) {
      switch (route.redirect.to.__typename) {
        case 'BlogPostRedirect':
        case 'BrandRedirect':
        case 'CategoryRedirect':
        case 'PageRedirect':
        case 'ProductRedirect': {
          // For dynamic redirects, assume an internal redirect and construct the URL from the path
          const redirectUrl = new URL(route.redirect.to.path, request.url);

          return NextResponse.redirect(redirectUrl, redirectConfig);
        }

        default: {
          // For manual redirects, redirect to the full URL to handle cases
          // where the destination URL might be external to the site.
          return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
        }
      }
    }

    const customerId = await getSessionCustomerId();
    let postfix = '';

    if (!request.nextUrl.search && !customerId && request.method === 'GET') {
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

      case 'NormalPage': {
        url = `/${locale}/webpages/normal/${node.id}`;
        break;
      }

      case 'ContactPage': {
        url = `/${locale}/webpages/contact/${node.id}`;
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

        const cleanPathName = clearLocaleFromPath(pathname, locale);

        if (cleanPathName === '/' && postfix) {
          url = `/${locale}${postfix}`;
          break;
        }

        url = `/${locale}${cleanPathName}`;
      }
    }

    const rewriteUrl = new URL(url, request.url);

    rewriteUrl.search = request.nextUrl.search;

    return NextResponse.rewrite(rewriteUrl);
  };
};
