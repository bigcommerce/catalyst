import { NextRequest, NextResponse } from 'next/server';

import client from '~/client';

import { withInternalAuth } from '../_internal-auth';

const handler = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const path = searchParams.get('path');
  const withSearchParams = searchParams.get('search') === 'hasSearchParams';

  if (path) {
    const node = await client.getRoute(
      { path, withSearchParams },
      { cache: null, next: { revalidate: 60 * 30 } },
    );

    // Middleware is the current consumer of this endpoint. If you need to modify this, ensure middleware is updated.
    return NextResponse.json(node);
  }

  return new NextResponse('Missing path', { status: 400 });
};

export const GET = withInternalAuth(handler);

export const runtime = 'edge';
