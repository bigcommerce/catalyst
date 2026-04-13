import { getLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const ValidateCartQuery = graphql(`
  query ValidateCartQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
        entityId
      }
    }
  }
`);

export async function validateCartId(cartId?: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const locale = await getLocale();

  const response = await client.fetch({
    document: ValidateCartQuery,
    variables: { cartId },
    customerAccessToken,
    locale,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart],
      },
    },
  });

  return response.data.site.cart;
}
