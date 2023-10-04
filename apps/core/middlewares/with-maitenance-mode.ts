import { NextResponse } from 'next/server';

import client from '../client';
import { type MiddlewareFactory } from '../utils/composeMiddlewares';

export const withMaintenanceMode: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const settings = await client.getStoreSettings();

    if (settings?.status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/maintenance`, request.url), { status: 503 });
    }

    return next(request, event);
  };
};
