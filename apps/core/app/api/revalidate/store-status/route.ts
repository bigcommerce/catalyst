import { NextResponse } from 'next/server';

import { getStoreStatus } from '~/client/queries/getStoreStatus';
import { kv } from '~/lib/kv';

import { withInternalAuth } from '../../_internal-auth';

const STORE_STATUS_KEY = 'v2_storeStatus';

const handler = async () => {
  const status = await getStoreStatus();

  if (!status) {
    return new NextResponse('Unable to revalidate store status', { status: 500 });
  }

  const expiryTime = Date.now() + 1000 * 60 * 5; // 5 minutes;

  try {
    await kv.set(STORE_STATUS_KEY, { status, expiryTime });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return NextResponse.json(status);
};

export const POST = withInternalAuth(handler);

export const runtime = 'edge';
