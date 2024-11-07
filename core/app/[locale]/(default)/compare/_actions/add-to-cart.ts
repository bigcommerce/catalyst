'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';

export const addToCart = async (id: string): Promise<void> => {
  const cartId = cookies().get('cartId')?.value;

  let cart;

  try {
    cart = await getCart(cartId);

    if (cart) {
      cart = await addCartLineItem(cart.entityId, {
        lineItems: [
          {
            productEntityId: Number(id),
            quantity: 1,
          },
        ],
      });

      if (!cart?.entityId) {
        // return { status: 'error', error: 'Failed to add product to cart.' };
        return;
      }

      revalidateTag(TAGS.cart);

      // return { status: 'success', data: cart };
      return;
    }

    cart = await createCart([{ productEntityId: Number(id), quantity: 1 }]);

    if (!cart?.entityId) {
      // return { status: 'error', error: 'Failed to add product to cart.' };
      return;
    }

    cookies().set({
      name: 'cartId',
      value: cart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    revalidateTag(TAGS.cart);

    // return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // return { status: 'error', error: error.message };
    }

    // return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
};
