import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const SUBMIT_CUSTOMER_CHANGE_PASSWORD_MUTATION = graphql(`
  mutation CustomerChangePassword($input: ChangePasswordInput!) {
    customer {
      changePassword(input: $input) {
        errors {
          ... on ValidationError {
            message
            path
          }
          ... on CustomerDoesNotExistError {
            message
          }
          ... on CustomerPasswordError {
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

type Variables = VariablesOf<typeof SUBMIT_CUSTOMER_CHANGE_PASSWORD_MUTATION>;

export const submitCustomerChangePassword = async ({
  currentPassword,
  newPassword,
}: Variables['input']) => {
  const customerId = await getSessionCustomerId();
  const variables = {
    input: {
      currentPassword,
      newPassword,
    },
  };

  const response = await client.fetch({
    document: SUBMIT_CUSTOMER_CHANGE_PASSWORD_MUTATION,
    variables,
    customerId,
  });

  return response.data.customer.changePassword;
};
