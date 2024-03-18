import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { UnassignCartFromCustomerInput } from '../generated/graphql';
import { graphql } from '../graphql';

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

export const unassignCartFromCustomer = async (
  cartEntityId: UnassignCartFromCustomerInput['cartEntityId'],
) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UNASSIGN_CART_FROM_CUSTOMER_MUTATION,
    variables: {
      unassignCartFromCustomerInput: {
        cartEntityId,
      },
    },
    customerId: Number(customerId),
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.unassignCartFromCustomer?.cart;
};
