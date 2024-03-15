import { client } from '..';
import { AssignCartToCustomerInput } from '../generated/graphql';
import { graphql } from '../graphql';

const ASSIGN_CART_TO_CUSTOMER_MUTATION = graphql(`
  mutation AssignCartToCustomer($assignCartToCustomerInput: AssignCartToCustomerInput!) {
    cart {
      assignCartToCustomer(input: $assignCartToCustomerInput) {
        cart {
          entityId
        }
      }
    }
  }
`);

export const assignCartToCustomer = async (
  customerId: string,
  cartEntityId: AssignCartToCustomerInput['cartEntityId'],
) => {
  const response = await client.fetch({
    document: ASSIGN_CART_TO_CUSTOMER_MUTATION,
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
