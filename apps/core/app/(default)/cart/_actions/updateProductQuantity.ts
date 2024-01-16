'use server';

import { CartLineItemInput, UpdateCartLineItemInput } from '../../../../clients/old';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { updateCartLineItem } from '~/clients/new/mutations/updateCartLineItem';

interface UpdateProductQuantityParams extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

export async function updateProductQuantity({
  lineItemEntityId,
  productEntityId,
  quantity,
  variantEntityId,
}: UpdateProductQuantityParams) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    throw new Error('No cartId cookie found');
  }

  if (!lineItemEntityId) {
    throw new Error('No lineItemEntityId found');
  }

  const cartLineItemData = Object.assign(
    { quantity, productEntityId },
    variantEntityId && { variantEntityId },
  );

  const updatedCart = await updateCartLineItem(cartId, lineItemEntityId, {
    lineItem: cartLineItemData,
  });

  if (!updatedCart) {
    throw new Error('Failed to change product quantity in Cart');
  }

  revalidatePath('/cart');
}
