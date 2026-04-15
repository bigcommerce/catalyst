import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

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

  const response = await client.fetch({
    document: ValidateCartQuery,
    variables: { cartId },
    customerAccessToken,
  });

  return response.data.site.cart;
}
