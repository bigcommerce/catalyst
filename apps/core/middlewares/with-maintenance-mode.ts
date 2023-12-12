import { NextResponse } from 'next/server';

import { StorefrontStatusType } from '~/client/generated/graphql';
import { getStoreSettings } from '~/client/queries/getStoreSettings';

import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

const STORE_STATUS_KEY = 'storeStatus';

const getExistingStatus = async () => {
  try {
    return await kv.get<StorefrontStatusType>(STORE_STATUS_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setKvStatus = async (status?: StorefrontStatusType | null) => {
  try {
    await kv.set(STORE_STATUS_KEY, status, {
      ex: 60 * 5, // 5 minutes
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const getMaintenanceStatus = async () => {
  try {
    let status = await getExistingStatus();

    if (!status) {
      const settings = await getStoreSettings();

      if (settings) {
        status = settings.status;
      }

      await setKvStatus(status);
    }

    return status;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export const withMaintenanceMode: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const status = await getMaintenanceStatus();

    if (status === 'MAINTENANCE') {
      // 503 status code not working - https://github.com/vercel/next.js/issues/50155
      return NextResponse.rewrite(new URL(`/maintenance`, request.url), { status: 503 });
    }

    return next(request, event);
  };
};
