'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { graphql } from '~/client/graphql';
import { deleteCartLineItem } from '~/client/mutations/delete-cart-line-item';

type DeleteCartLineItemInput = ReturnType<typeof graphql.scalar<'DeleteCartLineItemInput'>>;

export async function removeItem({
  lineItemEntityId,
}: Omit<DeleteCartLineItemInput, 'cartEntityId'>) {
  try {
    const cartId = cookies().get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: 'No cartId cookie found' };
    }

    if (!lineItemEntityId) {
      return { status: 'error', error: 'No lineItemEntityId found' };
    }

    const cart = await deleteCartLineItem(cartId, lineItemEntityId);

    // If we remove the last item in a cart the cart is deleted
    // so we need to remove the cartId cookie
    // TODO: We need to figure out if it actually failed.
    if (!cart) {
      cookies().delete('cartId');
    }

    revalidateTag('cart');

    return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
}
