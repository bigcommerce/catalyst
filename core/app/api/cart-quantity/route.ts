import { NextRequest, NextResponse } from 'next/server';

import { getChannelIdFromLocale } from '~/channels.config';
import { getCart } from '~/client/queries/get-cart';
import { getCartId } from '~/lib/cookies/cart';

export const GET = async (request: NextRequest) => {
  const cartId = await getCartId();

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') ?? undefined;

  if (cartId) {
    const cart = await getCart(cartId, getChannelIdFromLocale(locale));

    return NextResponse.json({ count: cart?.lineItems.totalQuantity ?? 0 });
  }

  return NextResponse.json({ count: 0 });
};

export const runtime = 'edge';
