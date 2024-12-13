'use server';

import { getTranslations } from 'next-intl/server';
import { z, ZodError } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ChangePasswordFieldsSchema = z.object({
  customerId: z.string(),
  customerToken: z.string(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

const ChangePasswordSchema = ChangePasswordFieldsSchema.omit({
  currentPassword: true,
}).required();

const ChangePasswordMutation = graphql(`
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

interface ChangePasswordResponse {
  status: 'success' | 'error';
  message: string;
}

export const changePassword = async (formData: FormData): Promise<ChangePasswordResponse> => {
  const t = await getTranslations('ChangePassword');

  try {
    const parsedData = ChangePasswordSchema.parse({
      customerId: formData.get('customer-id'),
      customerToken: formData.get('customer-token'),
      newPassword: formData.get('new-password'),
      confirmPassword: formData.get('confirm-password'),
    });

    const response = await client.fetch({
      document: ChangePasswordMutation,
      variables: {
        input: {
          token: parsedData.customerToken,
          customerEntityId: Number(parsedData.customerId),
          newPassword: parsedData.newPassword,
        },
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.resetPassword;

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        throw new Error(error.message);
      });
    }

    return {
      status: 'success',
      message: t('confirmChangePassword'),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof ZodError) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('Errors.error') };
  }
};
