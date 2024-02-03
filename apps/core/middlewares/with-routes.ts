import { NextRequest, NextResponse } from 'next/server';

import { getRoute } from '~/client/queries/getRoute';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';
import { Redirect, Route } from '~/client/generated/graphql';

type Node = Awaited<ReturnType<typeof getRoute>>;

const createRewriteUrl = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);

  url.search = request.nextUrl.search;

  return url;
};

const getCachedRoute = async (request: NextRequest) => {
  try {
    const cachedRoute = await kv.get<{ redirect:Redirect, node: Node }>(request.nextUrl.pathname);

    return cachedRoute;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setKvRoute = async (request: NextRequest, route: Route) => {
  try {
    await kv.set(
      request.nextUrl.pathname,
      { route },
      {
        ex: 60 * 30, // 30 minutes
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const getRouteByRequest = async (request: NextRequest) => {
  try {
    const route = await getCachedRoute(request);

    if (route !== undefined && route !== null) {
      return route;
    }

    const routeResult = await getRoute(request.nextUrl.pathname);

    if (routeResult !== undefined && routeResult !== null) {
      await setKvRoute(request, routeResult);
    }

    return routeResult;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export const withRoutes: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const route = await getRouteByRequest(request);

    // Follow redirects if found on the route
    // Use 301 status code as it is more universally supported by crawlers
    const redirectConfig = { status: 301 }
    
    if (route?.redirect) {
      switch (route.redirect.to.__typename) {
        case 'ManualRedirect':{
          // For manual redirects, redirect to the full URL to handle cases 
          // where the destination URL might be external to the site
          return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
        }
        
        default: {
          // For all other cases, assume an internal redirect and construct the URL
          // based on the current request URL to maintain internal redirection
          // in non-production environments
          const redirectPathname = new URL(route.redirect.toUrl).pathname;
          const redirectUrl = new URL(redirectPathname, request.url)
          return NextResponse.redirect(redirectUrl, redirectConfig);
        }
      }
    }

    const node = route?.node;
    switch (node?.__typename) {
      case 'Brand': {
        const url = createRewriteUrl(`/brand/${node.entityId}`, request);

        return NextResponse.rewrite(url);
      }

      case 'Category': {
        const url = createRewriteUrl(`/category/${node.entityId}`, request);

        return NextResponse.rewrite(url);
      }

      case 'Product': {
        const url = createRewriteUrl(`/product/${node.entityId}`, request);

        return NextResponse.rewrite(url);
      }

      case ('RawHtmlPage'): {
        // fast path for raw html pages
        const url = createRewriteUrl(`/api/raw-page/${node.id}`, request);

        return NextResponse.rewrite(url);
      }

      default:
        return next(request, event);
    }
  };
};
