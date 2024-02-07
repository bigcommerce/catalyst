import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerId } from '~/auth';
import { getRoute } from '~/client/queries/getRoute';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

type Node = Awaited<ReturnType<typeof getRoute>>;

const createRewriteUrl = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);

  url.search = request.nextUrl.search;

  return url;
};

const getExistingRoute = async (request: NextRequest) => {
  try {
    const route = await kv.get<{ node: Node }>(request.nextUrl.pathname);

    return route?.node;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setKvRoute = async (request: NextRequest, node: Node) => {
  try {
    await kv.set(
      request.nextUrl.pathname,
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

const getCustomUrlNode = async (request: NextRequest) => {
  try {
    const route = await getExistingRoute(request);

    if (route !== undefined) {
      return route;
    }

    const node = await getRoute(request.nextUrl.pathname);

    if (node !== undefined) {
      await setKvRoute(request, node);
    }

    return node;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const node = await getCustomUrlNode(request);
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
