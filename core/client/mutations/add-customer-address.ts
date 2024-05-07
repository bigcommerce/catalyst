import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const ADD_CUSTOMER_ADDRESS_MUTATION = graphql(`
  mutation addCustomerAddress($input: AddCustomerAddressInput!, $reCaptchaV2: ReCaptchaV2Input) {
    customer {
      addCustomerAddress(input: $input, reCaptchaV2: $reCaptchaV2) {
        errors {
          ... on CustomerAddressCreationError {
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

type AddCustomerAddressInput = VariablesOf<typeof ADD_CUSTOMER_ADDRESS_MUTATION>['input'];

interface AddCustomerAddress {
  input: AddCustomerAddressInput;
  reCaptchaToken?: string;
}

export const addCustomerAddress = async ({ input, reCaptchaToken }: AddCustomerAddress) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: ADD_CUSTOMER_ADDRESS_MUTATION,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      input,
      ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
    },
  });

  return response.data.customer.addCustomerAddress;
};
