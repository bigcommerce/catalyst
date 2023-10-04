import { NextRequest, NextResponse } from 'next/server';

import client from '~/client';

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const path = searchParams.get('path');

  if (path) {
    const node = await client.getRoute({ path }, { cache: null, next: { revalidate: 60 * 30 } });

    // Middleware is the current consumer of this endpoint. If you need to modify this, ensure middleware is updated.
    return NextResponse.json(node);
  }

  return new NextResponse('Missing path', { status: 400 });
};

export const runtime = 'edge';
