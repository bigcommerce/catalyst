'use server';

import { unstable_expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { clearCartId, getCartId } from '~/lib/cart';

// Import validation with a dynamic import to avoid circular dependency
let validatePromotionGifts: any = null;

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
  skipValidation = false,
}: Omit<DeleteCartLineItemInput, 'cartEntityId'> & { skipValidation?: boolean }) {
  const t = await getTranslations('Cart.Errors');

  const customerAccessToken = await getSessionCustomerAccessToken();

  const cartId = await getCartId();

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
    await clearCartId();
  }

  unstable_expireTag(TAGS.cart);

  // Validate and adjust free gifts after item removal (unless skipped to avoid circular calls)
  if (!skipValidation && cart) {
    if (!validatePromotionGifts) {
      validatePromotionGifts = (await import('./validate-promotion-gifts')).validatePromotionGifts;
    }

    await validatePromotionGifts();
  }

  return cart;
}
