import { NextResponse } from 'next/server';

import { redirectToCheckout } from '~/app/[locale]/(default)/cart/_actions/redirect-to-checkout';
import { getCartId } from '~/lib/cart';

export const GET = async () => {
  try {
    const cartId = await getCartId();

    if (!cartId) {
      return NextResponse.json({ error: 'cart id is not defined' });
    }

    const redirectData = await redirectToCheckout(cartId);

    return NextResponse.json(redirectData);
  } catch (error) {
    return NextResponse.json({ error });
  }
};
