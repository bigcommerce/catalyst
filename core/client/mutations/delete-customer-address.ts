import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const DELETE_CUSTOMER_ADDRESS_MUTATION = graphql(`
  mutation DeleteCustomerAddress(
    $reCaptcha: ReCaptchaV2Input
    $input: DeleteCustomerAddressInput!
  ) {
    customer {
      deleteCustomerAddress(reCaptchaV2: $reCaptcha, input: $input) {
        errors {
          __typename
          ... on CustomerAddressDeletionError {
            __typename
            message
          }
          ... on CustomerNotLoggedInError {
            __typename
            message
          }
        }
      }
    }
  }
`);

type AddressId = VariablesOf<typeof DELETE_CUSTOMER_ADDRESS_MUTATION>['input']['addressEntityId'];

export const deleteCustomerAddress = async (addressId: AddressId, reCaptchaToken?: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: DELETE_CUSTOMER_ADDRESS_MUTATION,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
    variables: {
      input: {
        addressEntityId: addressId,
      },
      ...(reCaptchaToken && { reCaptcha: { token: reCaptchaToken } }),
    },
  });

  return response.data.customer.deleteCustomerAddress;
};
