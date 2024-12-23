import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getBestSellingProducts,
  getFeaturedProducts,
  getNewestProducts,
} from '~/client/queries/get-products';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ group: string }> },
) => {
  const { group } = await params;

  const querySchema = z.enum(['best-selling', 'featured', 'newest']);

  const parseResult = querySchema.safeParse(group);

  if (!parseResult.success) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid group parameter' },
      { status: 400 },
    );
  }

  let result;

  switch (parseResult.data) {
    case 'best-selling':
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
