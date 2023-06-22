'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import client from '~/client';

export async function handleAddToCart(productEntityId: number) {
  const cartId = cookies().get('cartId')?.value;

  if (cartId) {
    await client.addCartLineItem(cartId, {
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
  const cart = await client.createCart([
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
