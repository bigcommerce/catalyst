'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { graphql } from '~/client/graphql';
import { updateCartLineItem } from '~/client/mutations/update-cart-line-item';

type CartLineItemInput = ReturnType<typeof graphql.scalar<'CartLineItemInput'>>;
type UpdateCartLineItemInput = ReturnType<typeof graphql.scalar<'UpdateCartLineItemInput'>>;

interface UpdateProductQuantityParams extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

export async function updateProductQuantity({
  lineItemEntityId,
  productEntityId,
  quantity,
  variantEntityId,
  selectedOptions,
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
    selectedOptions && { selectedOptions },
  );

  const updatedCart = await updateCartLineItem(cartId, lineItemEntityId, {
    lineItem: cartLineItemData,
  });

  if (!updatedCart) {
    throw new Error('Failed to change product quantity in Cart');
  }

  revalidatePath('/cart');
}
