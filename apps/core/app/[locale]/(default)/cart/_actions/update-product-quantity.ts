'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { CartLineItemInput, UpdateCartLineItemInput } from '~/client/generated/graphql';
import { updateCartLineItem } from '~/client/mutations/update-cart-line-item';

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

  // reset shipping estimation on update product quantity
  cookies().set({
    name: 'shippingCosts',
    value: JSON.stringify({
      shippingCostTotal: 0,
      handlingCostTotal: 0,
      selectedShippingOption: '',
    }),
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });

  revalidatePath('/cart');
}
