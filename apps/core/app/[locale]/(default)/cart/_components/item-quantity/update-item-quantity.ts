'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { graphql } from '~/client/graphql';
import { updateCartLineItem } from '~/client/mutations/update-cart-line-item';

import { removeItem } from '../../_actions/remove-item';

type CartLineItemInput = ReturnType<typeof graphql.scalar<'CartLineItemInput'>>;
type UpdateCartLineItemInput = ReturnType<typeof graphql.scalar<'UpdateCartLineItemInput'>>;

interface UpdateProductQuantityParams extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

export async function updateItemQuantity({
  lineItemEntityId,
  productEntityId,
  quantity,
  variantEntityId,
  selectedOptions,
}: UpdateProductQuantityParams) {
  try {
    const cartId = cookies().get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: 'No cartId cookie found' };
    }

    if (!lineItemEntityId) {
      return { status: 'error', error: 'No lineItemEntityId found' };
    }

    if (quantity === 0) {
      const result = await removeItem({ lineItemEntityId });

      return result;
    }

    const cartLineItemData = Object.assign(
      { quantity, productEntityId },
      variantEntityId && { variantEntityId },
      selectedOptions && { selectedOptions },
    );

    const cart = await updateCartLineItem(cartId, lineItemEntityId, {
      lineItem: cartLineItemData,
    });

    if (!cart) {
      return { status: 'error', error: 'Failed to change product quantity in Cart' };
    }

    revalidatePath('/cart');

    return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
}
