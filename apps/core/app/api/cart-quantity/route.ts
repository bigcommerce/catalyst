import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getCart } from '~/client/queries/get-cart';

export const GET = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (cartId) {
    const cart = await getCart(cartId);

    return NextResponse.json({ count: cart?.lineItems.totalQuantity ?? 0 });
  }

  return NextResponse.json({ count: 0 });
};

export const runtime = 'edge';
