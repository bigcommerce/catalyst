import { client } from '..';
import { graphql } from '../generated';
import { AssignCartToCustomerInput } from '../generated/graphql';

export const ASSIGN_CART_TO_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation AssignCartToCustomer($assignCartToCustomerInput: AssignCartToCustomerInput!) {
    cart {
      assignCartToCustomer(input: $assignCartToCustomerInput) {
        cart {
          entityId
        }
      }
    }
  }
`;

export const assignCartToCustomer = async (
  customerId: string,
  cartEntityId: AssignCartToCustomerInput['cartEntityId'],
) => {
  const mutation = graphql(ASSIGN_CART_TO_CUSTOMER_MUTATION);

  const response = await client.fetch({
    document: mutation,
    variables: {
      assignCartToCustomerInput: {
        cartEntityId,
      },
    },
    customerId: Number(customerId),
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.assignCartToCustomer?.cart;
};
