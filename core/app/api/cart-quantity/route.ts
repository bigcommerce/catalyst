import { NextRequest, NextResponse } from 'next/server';

import { getChannelIdFromLocale } from '~/channels.config';
import { getCartQuantity } from '~/client/queries/get-cart-quantity';
import { getCartId } from '~/lib/cookies/cart';

export const GET = async (request: NextRequest) => {
  const cartId = await getCartId();

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') ?? undefined;

  if (cartId) {
    const count = await getCartQuantity(cartId, getChannelIdFromLocale(locale));

    return NextResponse.json({ count });
  }

  return NextResponse.json({ count: 0 });
};

export const runtime = 'edge';
