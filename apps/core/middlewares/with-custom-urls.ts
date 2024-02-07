import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerId } from '~/auth';
import { getRoute } from '~/client/queries/getRoute';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';
import path from 'path';

type Node = Awaited<ReturnType<typeof getRoute>>;

const createRewriteUrl = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);

  url.search = request.nextUrl.search;

  return url;
};

const getExistingRoute = async (pathname: string) => {
  try {
    const route = await kv.get<{ node: Node }>(pathname);

    return route?.node;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setKvRoute = async (pathname: string, node: Node) => {
  try {
    await kv.set(
      pathname,
      { node },
      {
        ex: 60 * 30, // 30 minutes
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const getCustomUrlNode = async (pathname: string) => {
  try {
    const route = await getExistingRoute(pathname);

    if (route !== undefined) {
      return route;
    }

    const node = await getRoute(pathname);

    if (node !== undefined) {
      await setKvRoute(pathname, node);
    }

    return node;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const customerId = await getSessionCustomerId();
    const cartId = cookies().get('cartId');
    let postfix = '';

    // If the request is not dynamic, serve the static version
    if (
      !request.nextUrl.search && 
      !customerId && 
      !cartId && 
      request.method === 'GET'
      ) {
      postfix = '/static';
    }

    const { pathname, basePath } = request.nextUrl;

    // If the request is for the home page, skip this middleware
    if (pathname === '/' || pathname === basePath) {
      if(postfix) {
        return NextResponse.rewrite(createRewriteUrl(postfix, request));
      } else {
        return next(request, event);
      }
    }

    // Ask the GraphQL API for the node that matches the current URL
    // If KV is configured this should come from cache
    const node = await getCustomUrlNode(pathname);

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
        return next(request, event);
      }
    }
  };
};
