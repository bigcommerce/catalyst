'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
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
  const customerId = await getSessionCustomerId();

  try {
    const cartId = cookies().get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: t('cartNotFound') };
    }

    if (!lineItemEntityId) {
      return { status: 'error', error: t('itemNotFound') };
    }

    const response = await client.fetch({
      document: DeleteCartLineItemMutation,
      variables: {
        input: {
          cartEntityId: cartId,
          lineItemEntityId,
        },
      },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const cart = response.data.cart.deleteCartLineItem?.cart;

    // If we remove the last item in a cart the cart is deleted
    // so we need to remove the cartId cookie
    // TODO: We need to figure out if it actually failed.
    if (!cart) {
      cookies().delete('cartId');
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
