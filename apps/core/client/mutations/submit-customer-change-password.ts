import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

export const CustomerChangePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .required();

const Input = CustomerChangePasswordSchema.omit({ confirmPassword: true });

type SubmitCustomerChangePassword = z.infer<typeof Input>;

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

export const submitCustomerChangePassword = async ({
  currentPassword,
  newPassword,
}: SubmitCustomerChangePassword) => {
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
