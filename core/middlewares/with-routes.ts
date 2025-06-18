import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';
import { sendProductViewedEvent } from '~/lib/analytics/bigcommerce/data-events';
import { kvKey, STORE_STATUS_KEY } from '~/lib/kv/keys';

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

const StorefrontStatusSchema = z.union([
  z.literal('HIBERNATION'),
  z.literal('LAUNCHED'),
  z.literal('MAINTENANCE'),
  z.literal('PRE_LAUNCH'),
]);

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

// Cache TTL configuration from environment variables
const ROUTE_CACHE_TTL = parseInt(process.env.ROUTE_CACHE_TTL || '86400', 10); // Default: 24 hours
const STORE_STATUS_CACHE_TTL = parseInt(process.env.STORE_STATUS_CACHE_TTL || '3600', 10); // Default: 1 hour

const fetchAndCacheRoute = async (
  pathname: string,
  channelId: string,
  event: NextFetchEvent,
): Promise<Route> => {
  const route = await getRoute(pathname, channelId);

  // Cache with configurable TTL (default 24 hours)
  event.waitUntil(kv.set(kvKey(pathname, channelId), route, { ttl: ROUTE_CACHE_TTL }));

  return route;
};

const fetchAndCacheStatus = async (
  channelId: string,
  event: NextFetchEvent,
): Promise<StorefrontStatusType> => {
  const status = await getStoreStatus(channelId);

  if (status === undefined) {
    throw new Error('Failed to fetch new storefront status');
  }

  // Cache with configurable TTL (default 1 hour)
  event.waitUntil(
    kv.set(kvKey(STORE_STATUS_KEY, channelId), status, { ttl: STORE_STATUS_CACHE_TTL }),
  );

  return status;
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

    // Try to get cached values - TTL is handled by the cache layer
    let [route, status] = await kv.mget<Route | StorefrontStatusType>(
      kvKey(pathname, channelId),
      kvKey(STORE_STATUS_KEY, channelId),
    );

    // If cache miss, fetch fresh data (TTL handles expiry automatically)
    if (!status) {
      status = await fetchAndCacheStatus(channelId, event);
    }

    if (!route) {
      route = await fetchAndCacheRoute(pathname, channelId, event);
    }

    // Simple validation of the cached data
    const parsedRoute = RouteSchema.nullable().safeParse(route);
    const parsedStatus = StorefrontStatusSchema.safeParse(status);

    return {
      route: parsedRoute.success ? parsedRoute.data : undefined,
      status: parsedStatus.success ? parsedStatus.data : undefined,
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

    return NextResponse.rewrite(rewriteUrl);
  };
};

async function recordProductVisit(request: Request, productId: number) {
  const visitId = await getVisitIdCookie();
  const visitorId = await getVisitorIdCookie();

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
  }
}
