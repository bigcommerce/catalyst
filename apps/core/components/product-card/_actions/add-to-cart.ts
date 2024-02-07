'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';

export const addToCart = async (data: FormData) => {
  const productEntityId = Number(data.get('product_id'));

  const cartId = cookies().get('cartId')?.value;
  const cart = await getCart(cartId);

  try {
    if (cart) {
      await addCartLineItem(cart.entityId, {
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

    const newCart = await createCart([{ productEntityId, quantity: 1 }]);

    if (newCart) {
      cookies().set({
        name: 'cartId',
        value: newCart.entityId,
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });
    }

    revalidateTag('cart');
  } catch (e) {
    return { error: 'Something went wrong. Please try again.' };
  }
};
