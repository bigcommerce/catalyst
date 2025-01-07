'use server';

import { unstable_expireTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const DeleteCartLineItemMutation = graphql(`
  mutation DeleteCartLineItemMutation($input: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof DeleteCartLineItemMutation>;
type DeleteCartLineItemInput = Variables['input'];

export async function removeItem({
  lineItemEntityId,
}: Omit<DeleteCartLineItemInput, 'cartEntityId'>) {
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

    const response = await client.fetch({
      document: DeleteCartLineItemMutation,
      variables: {
        input: {
          cartEntityId: cartId,
          lineItemEntityId,
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const cart = response.data.cart.deleteCartLineItem?.cart;

    // If we remove the last item in a cart the cart is deleted
    // so we need to remove the cartId cookie
    // TODO: We need to figure out if it actually failed.
    if (!cart) {
      cookieStore.delete('cartId');
    }

    unstable_expireTag(TAGS.cart);

    return cart;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(t('somethingWentWrong'));
  }
}
