import { NextRequest, NextResponse } from 'next/server';

import { getRoute } from '~/client/queries/getRoute';

import { withInternalAuth } from '../_internal-auth';

const handler = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const path = searchParams.get('path');

  if (path) {
    const node = await getRoute(path);

    // Middleware is the current consumer of this endpoint. If you need to modify this, ensure middleware is updated.
    return NextResponse.json(node);
  }

  return new NextResponse('Missing path', { status: 400 });
};

export const GET = withInternalAuth(handler);

export const runtime = 'edge';
export const revalidate = 1800; // 30 min
