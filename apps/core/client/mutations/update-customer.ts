import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const UPDATE_CUSTOMER_MUTATION = graphql(`
  mutation updateCustomer($input: UpdateCustomerInput!) {
    customer {
      updateCustomer(input: $input) {
        customer {
          firstName
          lastName
        }
        errors {
          __typename
          ... on EmailAlreadyInUseError {
            message
          }
          ... on ValidationError {
            message
          }
          ... on CustomerDoesNotExistError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof UPDATE_CUSTOMER_MUTATION>;
type Input = Variables['input'];

interface UpdateCustomer {
  formFields: Input;
  reCaptchaToken?: string;
}

export const updateCustomer = async ({ formFields, reCaptchaToken }: UpdateCustomer) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UPDATE_CUSTOMER_MUTATION,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      input: formFields,
      ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
    },
  });

  return response.data.customer.updateCustomer;
};
