import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomerAccessToken } from '~/auth';
import { getProductPrices } from '~/belami/lib/fetch-product-prices';

export const GET = async (
  request: NextRequest,
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const searchParams = request.nextUrl.searchParams;
  const skus = searchParams.get('skus') ?? '';

  //console.log(skus);

  const prices = await getProductPrices(skus.split(','), customerAccessToken);

  return NextResponse.json({
    status: 'OK',
    message: 'Prices retrieved successfully!',
    data: prices
  }, {
    status: 200
  });
};

export const runtime = 'nodejs';