import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { UnassignCartFromCustomerInput } from '../generated/graphql';

export const UNASSIGN_CART_FROM_CUSTOMER_MUTATION = /* GraphQL */ `
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
`;

export const unassignCartFromCustomer = async (
  cartEntityId: UnassignCartFromCustomerInput['cartEntityId'],
) => {
  const mutation = graphql(UNASSIGN_CART_FROM_CUSTOMER_MUTATION);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: mutation,
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
