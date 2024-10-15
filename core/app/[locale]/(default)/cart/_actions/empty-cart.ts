'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const DeleteCartMutation = graphql(` 
    mutation deleteCart($deleteCartInput: DeleteCartInput!) {
      cart {
        deleteCart(input: $deleteCartInput) {
          deletedCartEntityId
        }
      }
    }
  `);

type Variables = VariablesOf<typeof DeleteCartMutation>;
type DeleteCartItemsInput = Variables['deleteCartInput'];

export async function emptyCarts({

}: Omit<DeleteCartItemsInput, 'cartEntityId'>) {
  const customerId = await getSessionCustomerId();

  try {
    const cartId = cookies().get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: 'No cartId cookie found' };
    }

    const response = await client.fetch({
      document: DeleteCartMutation,
      variables: {
        deleteCartInput: {
            cartEntityId: cartId
        },
      },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const cart = response.data.cart.deleteCart?.deletedCartEntityId;
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
