'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

import { removeItem } from './remove-item';

const UpdateCartLineItemMutation = graphql(`
  mutation UpdateCartLineItem($input: UpdateCartLineItemInput!) {
    cart {
      updateCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

type CartLineItemInput = ReturnType<typeof graphql.scalar<'CartLineItemInput'>>;
export type CartSelectedOptionsInput = ReturnType<
  typeof graphql.scalar<'CartSelectedOptionsInput'>
>;
type Variables = VariablesOf<typeof UpdateCartLineItemMutation>;
type UpdateCartLineItemInput = Variables['input'];

export interface UpdateProductQuantityParams extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

export const updateQuantity = async ({
  lineItemEntityId,
  productEntityId,
  quantity,
  variantEntityId,
  selectedOptions,
}: UpdateProductQuantityParams) => {
  const t = await getTranslations('Cart.Errors');

  const customerId = await getSessionCustomerId();

  try {
    const cartId = cookies().get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: t('cartNotFound') };
    }

    if (!lineItemEntityId) {
      return { status: 'error', error: t('itemNotFound') };
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

    const response = await client.fetch({
      document: UpdateCartLineItemMutation,
      variables: {
        input: {
          cartEntityId: cartId,
          lineItemEntityId,
          data: {
            lineItem: cartLineItemData,
          },
        },
      },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const cart = response.data.cart.updateCartLineItem?.cart;

    if (!cart) {
      return { status: 'error', error: t('failedToUpdateQuantity') };
    }

    revalidatePath('/cart');

    return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
};
