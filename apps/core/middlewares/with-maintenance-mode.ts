import { NextResponse } from 'next/server';

import client from '../client';
import { type MiddlewareFactory } from '../utils/composeMiddlewares';

export const withMaintenanceMode: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const response = await fetch(new URL(`/api/store-settings`, request.url), {
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
