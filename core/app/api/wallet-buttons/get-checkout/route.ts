import { NextRequest, NextResponse } from 'next/server';

import { getCheckout } from '~/client/queries/get-checkout';

export const GET = async (request: NextRequest) => {
  const checkoutId = request.nextUrl.searchParams.get('checkoutId');

  if (checkoutId) {
    try {
      const checkout = await getCheckout(checkoutId);

      return NextResponse.json(checkout);
    } catch (error) {
      return NextResponse.json({ error });
    }
  }

  return NextResponse.json(
    { error: 'Invalid request body: checkoutId is not provided' },
    { status: 400 },
  );
};
