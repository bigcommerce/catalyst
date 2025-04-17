'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/forgot-password-section/schema';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ResetPasswordMutation = graphql(`
  mutation ResetPasswordMutation($input: RequestResetPasswordInput!, $reCaptcha: ReCaptchaV2Input) {
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
  _lastResult: { lastResult: SubmissionResult | null; successMessage?: string },
  formData: FormData,
  // TODO: add recaptcha token
  // reCaptchaToken,
): Promise<{ lastResult: SubmissionResult | null; successMessage?: string }> => {
  const t = await getTranslations('Auth.Login.ForgotPassword');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
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

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    return {
      lastResult: submission.reply(),
      successMessage: t('confirmResetPassword', { email: submission.value.email }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return { lastResult: submission.reply({ formErrors: [error.message] }) };
    }

    return { lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }) };
  }
};
