import { client } from '..';
import { getSessionCustomerAccessToken } from '../../auth';
import { graphql, VariablesOf } from '../graphql';

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

type Variables = VariablesOf<typeof ASSIGN_CART_TO_CUSTOMER_MUTATION>;
type CartEntityId = Variables['assignCartToCustomerInput']['cartEntityId'];

export const assignCartToCustomer = async (cartEntityId: CartEntityId) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ASSIGN_CART_TO_CUSTOMER_MUTATION,
    variables: {
      assignCartToCustomerInput: {
        cartEntityId,
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.assignCartToCustomer?.cart;
};
