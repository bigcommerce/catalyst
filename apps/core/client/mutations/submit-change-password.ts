import { z } from 'zod';

import { client } from '..';
import { graphql } from '../graphql';

export const ChangePasswordSchema = z
  .object({
    customerId: z.string(),
    customerToken: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .required();

interface SubmitChangePassword {
  newPassword: z.infer<typeof ChangePasswordSchema>['newPassword'];
  token: string;
  customerEntityId: number;
}

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

export const submitChangePassword = async ({
  newPassword,
  token,
  customerEntityId,
}: SubmitChangePassword) => {
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

  return response.data;
};
