import { NextRequest, NextResponse } from 'next/server';

import client from '../client';
import { type MiddlewareFactory } from '../utils/composeMiddlewares';

const createRewriteUrl = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);

  url.search = request.nextUrl.search;

  return url;
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const response = await fetch(
      new URL(
        `/api/route?path=${request.nextUrl.pathname}`,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.url,
      ),
    );

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
