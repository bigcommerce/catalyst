'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/forgot-password-section/schema';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ResetPasswordMutation = graphql(`
  mutation ResetPassword($input: RequestResetPasswordInput!, $reCaptcha: ReCaptchaV2Input) {
    customer {
      requestResetPassword(input: $input, reCaptchaV2: $reCaptcha) {
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

export const resetPassword = async (
  _lastResult: (SubmissionResult & { successMessage?: string }) | null,
  formData: FormData,
  // TODO: add recaptcha token
  // reCaptchaToken,
) => {
  const t = await getTranslations('Login.ForgotPassword');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: [t('Errors.error')] });
  }

  try {
    const response = await client.fetch({
      document: ResetPasswordMutation,
      variables: {
        input: {
          email: submission.value.email,
          path: '/change-password',
        },
        // ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.requestResetPassword;

    if (result.errors.length === 0) {
      return {
        ...submission.reply(),
        successMessage: t('Form.confirmResetPassword', { email: submission.value.email }),
      };
    }

    return submission.reply({ formErrors: result.errors.map((error) => error.message) });
  } catch (error) {
    if (error instanceof Error) {
      return submission.reply({ formErrors: [error.message] });
    }

    return submission.reply({ formErrors: [t('Errors.error')] });
  }
};
