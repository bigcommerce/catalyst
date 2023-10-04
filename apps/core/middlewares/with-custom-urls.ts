import { NextResponse } from 'next/server';

import client from '../client';
import { type MiddlewareFactory } from '../utils/composeMiddlewares';

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
        const url = new URL(`/brand/${node.entityId}`, request.url);

        url.search = request.nextUrl.search;

        return NextResponse.rewrite(url);
      }

      default:
        return next(request, event);
    }
  };
};
