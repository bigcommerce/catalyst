import { NextRequest, NextResponse } from 'next/server';
import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';

export const GET = async (
  request: NextRequest,
) => {
  const searchParams = request.nextUrl.searchParams;
  const pmx = searchParams.get('pmx') || undefined;

  const priceMaxTriggers = pmx 
    ? JSON.parse(atob(pmx)) 
    : undefined;

  const rules = priceMaxTriggers && Object.values(priceMaxTriggers).length > 0 ? await getPriceMaxRules(priceMaxTriggers) : null;

  return NextResponse.json({
    status: 'OK',
    message: 'PriceMax rules retrieved successfully!',
    data: rules
  }, {
    status: 200
  });
};

export const runtime = 'nodejs';