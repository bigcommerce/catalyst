import { NextRequest, NextResponse } from 'next/server';

import client from '~/client';

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const path = searchParams.get('path');

  if (path) {
    const node = await client.getRoute({ path }, { cache: null, next: { revalidate: 60 * 30 } });

    return NextResponse.json(node);
  }

  return new Response('Missing path', { status: 400 });
};

export const runtime = 'edge';
