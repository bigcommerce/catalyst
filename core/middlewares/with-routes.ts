import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';
import { sendProductViewedEvent } from '~/lib/analytics/bigcommerce/data-events';
import { kvKey, STORE_STATUS_KEY } from '~/lib/kv/keys';
import { withGraphQLSpan, withBigCommerceSpan, addSpanAttributes } from '~/lib/otel';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

const GetRouteQuery = graphql(`
  query GetRouteQuery($path: String!) {
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
            ... on ManualRedirect {
              url
            }
          }
          fromPath
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
          ... on BlogPost {
            entityId
          }
        }
      }
    }
  }
`);

const getRoute = async (path: string, channelId?: string) => {
  return await withGraphQLSpan('getRoute', async () => {
    addSpanAttributes({
      'route.path': path,
      'route.channel_id': channelId || 'default',
    });

    const response = await client.fetch({
      document: GetRouteQuery,
      variables: { path },
      fetchOptions: { next: { revalidate } },
      channelId,
    });

    const route = response.data.site.route;
    
    // Add route information to span
    if (route?.node) {
      addSpanAttributes({
        'route.node_type': route.node.__typename,
        'route.has_redirect': !!route.redirect,
      });
    }

    return route;
  });
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
  return await withGraphQLSpan('getRawWebPageContent', async () => {
    addSpanAttributes({
      'webpage.id': id,
      'webpage.type': 'raw_html',
    });

    const response = await client.fetch({
      document: getRawWebPageContentQuery,
      variables: { id },
    });

    const node = response.data.node;

    if (node?.__typename !== 'RawHtmlPage') {
      throw new Error('Failed to fetch raw web page content');
    }

    // Add content size information
    addSpanAttributes({
      'webpage.content_size': node.htmlBody?.length || 0,
    });

    return node;
  });
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
  return await withGraphQLSpan('getStoreStatus', async () => {
    addSpanAttributes({
      'store.channel_id': channelId || 'default',
    });

    const { data } = await client.fetch({
      document: GetStoreStatusQuery,
      fetchOptions: { next: { revalidate: 300 } },
      channelId,
    });

    const status = data.site.settings?.status;
    
    // Add store status to span
    addSpanAttributes({
      'store.status': status || 'unknown',
    });

    return status;
  });
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
    z.object({ __typename: z.literal('ManualRedirect'), url: z.string() }),
  ]),
  fromPath: z.string(),
  toUrl: z.string(),
});

const NodeSchema = z.union([
  z.object({ __typename: z.literal('Product'), entityId: z.number() }),
  z.object({ __typename: z.literal('Category'), entityId: z.number() }),
  z.object({ __typename: z.literal('Brand'), entityId: z.number() }),
  z.object({ __typename: z.literal('ContactPage'), id: z.string() }),
  z.object({ __typename: z.literal('NormalPage'), id: z.string() }),
  z.object({ __typename: z.literal('RawHtmlPage'), id: z.string() }),
  z.object({ __typename: z.literal('Blog'), id: z.string() }),
  z.object({ __typename: z.literal('BlogPost'), entityId: z.number() }),
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
  if (path === `/${locale}` || path === `/${locale}/`) {
    return '/';
  }

  if (path.startsWith(`/${locale}/`)) {
    return path.replace(`/${locale}`, '');
  }

  return path;
};

const getRouteInfo = async (request: NextRequest, event: NextFetchEvent) => {
  const locale = request.headers.get('x-bc-locale') ?? '';
  const channelId = request.headers.get('x-bc-channel-id') ?? '';

  try {
    // For route resolution parity, we need to also include query params, otherwise certain redirects will not work.
    const pathname = clearLocaleFromPath(request.nextUrl.pathname + request.nextUrl.search, locale);

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

    // Add middleware-level attributes
    addSpanAttributes({
      'middleware.name': 'withRoutes',
      'request.locale': locale,
      'request.path': request.nextUrl.pathname,
      'request.method': request.method,
    });

    const { route, status } = await getRouteInfo(request, event);

    if (status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      addSpanAttributes({
        'response.type': 'maintenance_redirect',
        'response.status': 503,
      });
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
      // Add redirect information to span
      addSpanAttributes({
        'response.type': 'redirect',
        'redirect.from_path': route.redirect.fromPath,
        'redirect.to_type': route.redirect.to.__typename,
      });

      // Only carry over query params if the fromPath does not have any, as Bigcommerce 301 redirects support matching by specific query params.
      const fromPathSearchParams = new URL(route.redirect.fromPath, request.url).search;
      const searchParams = fromPathSearchParams.length > 0 ? '' : request.nextUrl.search;

      switch (route.redirect.to.__typename) {
        case 'BlogPostRedirect':
        case 'BrandRedirect':
        case 'CategoryRedirect':
        case 'PageRedirect':
        case 'ProductRedirect': {
          // For dynamic redirects, assume an internal redirect and construct the URL from the path
          const redirectUrl = new URL(route.redirect.to.path + searchParams, request.url);

          return NextResponse.redirect(redirectUrl, redirectConfig);
        }

        case 'ManualRedirect': {
          // For manual redirects, to.url will be a relative path if it is an internal redirect and an absolute URL if it is an external redirect.
          // URL constructor will correctly handle both cases.
          // If the manual redirect is an external URL, we should not carry query params.
          const redirectUrl = new URL(route.redirect.to.url, request.url);

          if (redirectUrl.origin === request.nextUrl.origin) {
            redirectUrl.search = searchParams;
          }

          return NextResponse.redirect(redirectUrl, redirectConfig);
        }

        default: {
          // If for some reason the redirect type is not recognized, use the toUrl as a fallback
          return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
        }
      }
    }

    const node = route?.node;
    let url: string;

    switch (node?.__typename) {
      case 'Brand': {
        url = `/${locale}/brand/${node.entityId}`;
        break;
      }

      case 'Category': {
        url = `/${locale}/category/${node.entityId}`;
        break;
      }

      case 'Product': {
        url = `/${locale}/product/${node.entityId}`;

        event.waitUntil(recordProductVisit(request, node.entityId));

        break;
      }

      case 'NormalPage': {
        url = `/${locale}/webpages/${node.id}/normal/`;
        break;
      }

      case 'ContactPage': {
        url = `/${locale}/webpages/${node.id}/contact/`;
        break;
      }

      case 'RawHtmlPage': {
        const { htmlBody } = await getRawWebPageContent(node.id);

        return new NextResponse(htmlBody, {
          headers: { 'content-type': 'text/html' },
        });
      }

      case 'Blog': {
        url = `/${locale}/blog`;
        break;
      }

      case 'BlogPost': {
        url = `/${locale}/blog/${node.entityId}`;
        break;
      }

      default: {
        const { pathname } = new URL(request.url);

        const cleanPathName = clearLocaleFromPath(pathname, locale);

        url = `/${locale}${cleanPathName}`;
      }
    }

    const rewriteUrl = new URL(url, request.url);

    rewriteUrl.search = request.nextUrl.search;

    // Add rewrite information to span
    addSpanAttributes({
      'response.type': 'rewrite',
      'rewrite.target_url': rewriteUrl.toString(),
      'rewrite.node_type': node?.__typename || 'unknown',
    });

    return NextResponse.rewrite(rewriteUrl);
  };
};

async function recordProductVisit(request: Request, productId: number) {
  return await withBigCommerceSpan('recordProductVisit', async () => {
    addSpanAttributes({
      'product.id': productId,
      'analytics.event_type': 'product_viewed',
    });

    const visitId = await getVisitIdCookie();
    const visitorId = await getVisitorIdCookie();

    addSpanAttributes({
      'analytics.has_visit_id': !!visitId,
      'analytics.has_visitor_id': !!visitorId,
    });

    if (visitId && visitorId) {
      await sendProductViewedEvent({
        productId,
        initiator: { visitId, visitorId },
        request: {
          url: request.url,
          refererUrl: request.headers.get('referer') || '',
          userAgent: request.headers.get('user-agent') || '',
        },
      });
      
      addSpanAttributes({
        'analytics.event_sent': true,
      });
    } else {
      addSpanAttributes({
        'analytics.event_sent': false,
        'analytics.skip_reason': 'missing_analytics_ids',
      });
    }
  });
}
