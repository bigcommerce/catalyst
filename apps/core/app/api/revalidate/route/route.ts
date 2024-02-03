import { NextRequest, NextResponse } from 'next/server';

import { getRoute } from '~/client/queries/getRoute';
import { kv } from '~/lib/kv';

import { withInternalAuth } from '../../_internal-auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isValidJson = (json: any): json is { pathname: string } => {
  if (typeof json !== 'object') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof json.pathname !== 'string') {
    return false;
  }

  return true;
};

const handler = async (request: NextRequest) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const bodyJson = await request.json();

  if (!isValidJson(bodyJson)) {
    return new NextResponse('Body must be a json object with a pathname field', { status: 400 });
  }

  const pathname = bodyJson.pathname;

  const node = await getRoute(pathname);

  const expiryTime = Date.now() + 1000 * 60 * 30; // 30 minutes;

  try {
    await kv.set(`v2_${pathname}`, { node, expiryTime });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return NextResponse.json(node);
};

export const POST = withInternalAuth(handler);

export const runtime = 'edge';
