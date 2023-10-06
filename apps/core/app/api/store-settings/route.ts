import { NextResponse } from 'next/server';

import client from '~/client';

import { withInternalAuth } from '../_internal-auth';

const handler = async () => {
  const settings = await client.getStoreSettings({ cache: null, next: { revalidate: 60 * 5 } });

  // Middleware is the current consumer of this endpoint. If you need to modify this, ensure middleware is updated.
  return NextResponse.json(settings);
};

export const GET = withInternalAuth(handler);

export const runtime = 'edge';
