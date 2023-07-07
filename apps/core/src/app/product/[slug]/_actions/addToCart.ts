'use server';

import { addCartLineItem, createCart } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

export async function handleAddToCart(productEntityId: number) {
  const cartId = cookies().get('cartId')?.value;

  if (cartId) {
    await addCartLineItem(cartId, {
      lineItems: [
        {
          productEntityId,
          quantity: 1,
        },
      ],
    });

    revalidateTag('cart');

    return;
  }

  // Create cart
  const cart = await createCart([
    {
      productEntityId,
      quantity: 1,
    },
  ]);

  if (cart) {
    cookies().set({
      name: 'cartId',
      value: cart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  }

  revalidateTag('cart');
}
