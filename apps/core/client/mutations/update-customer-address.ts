import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const UPDATE_CUSTOMER_ADDRESS_MUTATION = graphql(`
  mutation updateCustomerAddress(
    $input: UpdateCustomerAddressInput!
    $reCaptchaV2: ReCaptchaV2Input
  ) {
    customer {
      updateCustomerAddress(input: $input, reCaptchaV2: $reCaptchaV2) {
        errors {
          ... on CustomerAddressUpdateError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on ValidationError {
            message
            path
          }
        }
        address {
          entityId
          firstName
          lastName
        }
      }
    }
  }
`);

type UpdateCustomerAddressInput = VariablesOf<typeof UPDATE_CUSTOMER_ADDRESS_MUTATION>['input'];

interface UpdateCustomerAddress {
  input: UpdateCustomerAddressInput;
  reCaptchaToken?: string;
}

export const updateCustomerAddress = async ({ input, reCaptchaToken }: UpdateCustomerAddress) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UPDATE_CUSTOMER_ADDRESS_MUTATION,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      input,
      ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
    },
  });

  return response.data.customer.updateCustomerAddress;
};
