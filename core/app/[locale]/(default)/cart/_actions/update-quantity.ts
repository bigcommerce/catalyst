'use server';

import { expirePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
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

  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    if (!cartId) {
      throw new Error(t('cartNotFound'));
    }

    if (!lineItemEntityId) {
      throw new Error(t('lineItemNotFound'));
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
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const cart = response.data.cart.updateCartLineItem?.cart;

    if (!cart) {
      throw new Error(t('failedToUpdateQuantity'));
    }

    expirePath('/cart');

    return cart;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(t('somethingWentWrong'));
  }
};
