import { z } from 'zod';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const ChangePasswordFieldsSchema = z.object({
  customerId: z.string(),
  customerToken: z.string(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export const CustomerChangePasswordSchema = ChangePasswordFieldsSchema.omit({
  customerId: true,
  customerToken: true,
});

export const ChangePasswordSchema = ChangePasswordFieldsSchema.omit({
  currentPassword: true,
}).required();

const SUBMIT_CHANGE_PASSWORD_MUTATION = graphql(`
  mutation ChangePassword($input: ResetPasswordInput!) {
    customer {
      resetPassword(input: $input) {
        __typename
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

type ChangePasswordInput = VariablesOf<typeof SUBMIT_CHANGE_PASSWORD_MUTATION>['input'];

export const submitChangePassword = async ({
  newPassword,
  token,
  customerEntityId,
}: ChangePasswordInput) => {
  const variables = {
    input: {
      token,
      customerEntityId,
      newPassword,
    },
  };

  const response = await client.fetch({
    document: SUBMIT_CHANGE_PASSWORD_MUTATION,
    variables,
  });

  return response.data.customer.resetPassword;
};
