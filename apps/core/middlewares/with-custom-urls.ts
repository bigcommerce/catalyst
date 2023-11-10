import { NextRequest, NextResponse } from 'next/server';

import client from '../client';

import { type MiddlewareFactory } from './compose-middlewares';

const createRewriteUrl = (path: string, request: NextRequest) => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const url = new URL(path, forwardedHost ?? request.url);

  url.search = request.nextUrl.search;

  return url;
};

const getRequestUrl = (request: NextRequest) => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  return forwardedHost && forwardedProto ? `${forwardedProto}://${forwardedHost}` : request.url;
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const url = getRequestUrl(request);

    const response = await fetch(new URL(`/api/route?path=${request.nextUrl.pathname}`, url), {
      headers: {
        'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
      },
    });

    if (!response.ok) {
      throw new Error(`BigCommerce API returned ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const node = (await response.json()) as Awaited<ReturnType<typeof client.getRoute>>;

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

      default:
        return next(request, event);
    }
  };
};
