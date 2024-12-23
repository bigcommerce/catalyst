import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';
import { TAGS } from '../tags';

const GetCartQuery = graphql(`
  query GetCartQuantityQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
        entityId
        isTaxIncluded
        currencyCode
        lineItems {
          totalQuantity
        }
      }
    }
  }
`);

export const getCartQuantity = cache(async (cartId?: string, channelId?: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCartQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart],
      },
    },
    channelId,
  });

  const cart = response.data.site.cart;

  if (!cart) {
    return;
  }

  return cart.lineItems.totalQuantity;
});
