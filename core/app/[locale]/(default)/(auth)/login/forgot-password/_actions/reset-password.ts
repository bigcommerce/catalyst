'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

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

interface SubmitResetPasswordForm {
  formData: FormData;
  path: string;
  reCaptchaToken: string;
}

export const resetPassword = async ({
  formData,
  path,
  reCaptchaToken,
}: SubmitResetPasswordForm) => {
  const t = await getTranslations('Login.ForgotPassword');

  try {
    const parsedData = ResetPasswordSchema.parse({
      email: formData.get('email'),
    });

    const response = await client.fetch({
      document: ResetPasswordMutation,
      variables: {
        input: {
          email: parsedData.email,
          path,
        },
        ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.requestResetPassword;

    if (result.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'error',
      error: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: t('Errors.error') };
  }
};
