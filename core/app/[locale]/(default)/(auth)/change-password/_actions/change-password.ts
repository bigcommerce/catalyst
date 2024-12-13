'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/reset-password-section/schema';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

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

export async function changePassword(
  { token, customerEntityId }: { token: string; customerEntityId: string },
  _prevState: { lastResult: SubmissionResult | null; successMessage?: string },
  formData: FormData,
) {
  const t = await getTranslations('ChangePassword');
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply({ formErrors: [t('Form.error')] }) };
  }

  try {
    const response = await client.fetch({
      document: ChangePasswordMutation,
      variables: {
        input: {
          token,
          customerEntityId: Number(customerEntityId),
          newPassword: submission.value.password,
        },
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.resetPassword;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    return {
      lastResult: submission.reply(),
      successMessage: t('Form.successMessage'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('Errors.error')] }),
    };
  }
}
