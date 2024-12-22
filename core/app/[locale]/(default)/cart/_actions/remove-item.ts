'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCartId, removeCartId } from '~/lib/cookies/cart';

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
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const cartId = await getCartId();

    if (!cartId) {
      return { status: 'error', error: 'No cartId cookie found' };
    }

    if (!lineItemEntityId) {
      return { status: 'error', error: 'No lineItemEntityId found' };
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
    if (!cart) {
      await removeCartId();
    }

    revalidateTag(TAGS.cart);

    return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
}
