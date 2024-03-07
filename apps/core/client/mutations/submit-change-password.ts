import { z } from 'zod';

import { client } from '..';
import { graphql } from '../generated';

export const ChangePasswordSchema = z.object({
  newPassword: z.string(),
  confirmPassword: z.string(),
});

interface SubmitChangePassword {
  newPassword: z.infer<typeof ChangePasswordSchema>['newPassword'];
  token: string;
  customerEntityId: number;
}

const SUBMIT_CHANGE_PASSWORD_MUTATION = /* GraphQL */ `
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
`;

export const submitChangePassword = async ({
  newPassword,
  token,
  customerEntityId,
}: SubmitChangePassword) => {
  const mutation = graphql(SUBMIT_CHANGE_PASSWORD_MUTATION);

  const variables = {
    input: {
      token,
      customerEntityId,
      newPassword,
    },
  };

  const response = await client.fetch({
    document: mutation,
    variables,
  });

  return response.data;
};
