import { createClient } from '@bigcommerce/catalyst-client';
import { getDefaultFetch } from '@bigcommerce/catalyst-middleware-fetch';
import { NextRequest, NextResponse } from 'next/server';

import { graphql } from '~/client/graphql';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';
import { sendProductViewedEvent } from '~/lib/analytics/bigcommerce/data-events';
import { backendUserAgent } from '~/userAgent';

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

// Create a client instance with catalyst-middleware-fetch for caching
const createCachedClient = async () => {
  const catalystFetch = await getDefaultFetch();

  return createClient({
    storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
    storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
    channelId: process.env.BIGCOMMERCE_CHANNEL_ID ?? '1',
    backendUserAgentExtensions: backendUserAgent,
    customFetch: catalystFetch.fetch.bind(catalystFetch),
  });
};

const getRoute = async (path: string, channelId?: string) => {
  const client = await createCachedClient();

  const response = await client.fetch({
    document: GetRouteQuery,
    variables: { path },
    fetchOptions: {
      next: { revalidate: 1800 }, // 30 minutes
    },
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
  const client = await createCachedClient();

  const response = await client.fetch({
    document: getRawWebPageContentQuery,
    variables: { id },
    fetchOptions: {
      next: { revalidate: 1800 }, // 30 minutes
    },
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
  const client = await createCachedClient();

  const { data } = await client.fetch({
    document: GetStoreStatusQuery,
    fetchOptions: {
      next: { revalidate: 300 }, // 5 minutes
    },
    channelId,
  });

  return data.site.settings?.status;
};

// Types for route and status data
// type Route = Awaited<ReturnType<typeof getRoute>>;
// type StorefrontStatusType = ReturnType<typeof graphql.scalar<'StorefrontStatusType'>>;

const clearLocaleFromPath = (path: string, locale: string) => {
  if (path === `/${locale}` || path === `/${locale}/`) {
    return '/';
  }

  if (path.startsWith(`/${locale}/`)) {
    return path.replace(`/${locale}`, '');
  }

  return path;
};

const getRouteInfo = async (request: NextRequest) => {
  const locale = request.headers.get('x-bc-locale') ?? '';
  const channelId = request.headers.get('x-bc-channel-id') ?? '';

  try {
    // For route resolution parity, we need to also include query params, otherwise certain redirects will not work.
    const pathname = clearLocaleFromPath(request.nextUrl.pathname + request.nextUrl.search, locale);

    // Fetch both route and status concurrently - caching is handled by catalyst-middleware-fetch
    const [route, status] = await Promise.all([
      getRoute(pathname, channelId),
      getStoreStatus(channelId),
    ]);

    return {
      route,
      status,
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

    const { route, status } = await getRouteInfo(request);

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
