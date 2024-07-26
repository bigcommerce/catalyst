import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const UNASSIGN_CART_FROM_CUSTOMER_MUTATION = graphql(`
  mutation UnassignCartFromCustomer(
    $unassignCartFromCustomerInput: UnassignCartFromCustomerInput!
  ) {
    cart {
      unassignCartFromCustomer(input: $unassignCartFromCustomerInput) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof UNASSIGN_CART_FROM_CUSTOMER_MUTATION>;
type UnassignCartFromCustomerInput = Variables['unassignCartFromCustomerInput'];

export const unassignCartFromCustomer = async (
  cartEntityId: UnassignCartFromCustomerInput['cartEntityId'],
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: UNASSIGN_CART_FROM_CUSTOMER_MUTATION,
    variables: {
      unassignCartFromCustomerInput: {
        cartEntityId,
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.unassignCartFromCustomer?.cart;
};
