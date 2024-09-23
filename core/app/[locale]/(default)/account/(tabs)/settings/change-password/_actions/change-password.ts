'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ChangePasswordFieldsSchema = z.object({
  customerId: z.string(),
  customerToken: z.string(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

const CustomerChangePasswordSchema = ChangePasswordFieldsSchema.omit({
  customerId: true,
  customerToken: true,
});

const CustomerChangePasswordMutation = graphql(`
  mutation CustomerChangePasswordMutation($input: ChangePasswordInput!) {
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

export interface State {
  status: 'idle' | 'error' | 'success';
  message?: string;
}

export const changePassword = async (_previousState: unknown, formData: FormData) => {
  const t = await getTranslations('Account.Settings.ChangePassword');

  const customerId = await getSessionCustomerId();

  try {
    const parsedData = CustomerChangePasswordSchema.parse({
      newPassword: formData.get('new-password'),
      currentPassword: formData.get('current-password'),
      confirmPassword: formData.get('confirm-password'),
    });

    const response = await client.fetch({
      document: CustomerChangePasswordMutation,
      variables: {
        input: {
          currentPassword: parsedData.currentPassword,
          newPassword: parsedData.newPassword,
        },
      },
      customerId,
    });

    const result = response.data.customer.changePassword;

    if (result.errors.length === 0) {
      return { status: 'success', message: t('success') };
    }

    return {
      status: 'error',
      message: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        status: 'error',
        message: error.issues
          .map(({ path, message }) => `${path.toString()}: ${message}.`)
          .join('\n'),
      };
    }

    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('error') };
  }
};
