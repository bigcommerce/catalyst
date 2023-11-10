import { NextRequest, NextResponse } from 'next/server';

import client from '../client';

import { type MiddlewareFactory } from './compose-middlewares';

const getRequestUrl = (request: NextRequest) => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  return forwardedHost && forwardedProto ? `${forwardedProto}://${forwardedHost}` : request.url;
};

export const withMaintenanceMode: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const url = getRequestUrl(request);

    const response = await fetch(new URL(`/api/store-settings`, url), {
      headers: {
        'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
      },
    });

    if (!response.ok) {
      throw new Error(`BigCommerce API returned ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const settings = (await response.json()) as Awaited<ReturnType<typeof client.getStoreSettings>>;

    if (settings?.status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/maintenance`, request.url), { status: 503 });
    }

    return next(request, event);
  };
};
