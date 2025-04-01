import { NextRequest, NextResponse } from 'next/server';

import { fetchCart } from '~/client/queries/get-cart';
import { getCurrencyData } from '~/client/queries/get-currency-data';

export const GET = async (request: NextRequest) => {
  const cartId = request.nextUrl.searchParams.get('cartId');

  if (cartId) {
    try {
      const cart = await fetchCart(cartId);

      const currencyData = await getCurrencyData(cart.data.site.cart?.currencyCode);

      return NextResponse.json({
        data: {
          site: {
            ...cart.data.site,
            ...currencyData.data.site,
          },
        },
      });
    } catch (error) {
      return NextResponse.json({ error });
    }
  }

  return NextResponse.json(
    { error: 'Invalid request body: cartId is not provided' },
    { status: 400 },
  );
};
