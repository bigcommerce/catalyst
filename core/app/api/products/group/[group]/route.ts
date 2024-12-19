import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getBestSellingProducts,
  getFeaturedProducts,
  getNewestProducts,
} from '~/client/queries/get-products';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('group');

  const querySchema = z.enum(['bestSelling', 'featured', 'newest']);

  const parseResult = querySchema.safeParse(query);

  if (!parseResult.success) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid query parameter' },
      { status: 400 },
    );
  }

  if (query == null) {
    return NextResponse.json(
      { status: 'error', error: 'Search query is required' },
      { status: 400 },
    );
  }

  let result;

  switch (parseResult.data) {
    case 'bestSelling':
      result = await getBestSellingProducts();
      break;

    case 'featured':
      result = await getFeaturedProducts();
      break;

    case 'newest':
      result = await getNewestProducts();
      break;
  }

  return NextResponse.json(result);
};

export const runtime = 'edge';
