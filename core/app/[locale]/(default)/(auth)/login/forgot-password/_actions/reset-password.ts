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

interface SubmitResetPasswordResponse {
  status: 'success' | 'error';
  message: string;
}

export const resetPassword = async (
  formData: FormData,
  path: string,
  reCaptchaToken?: string,
): Promise<SubmitResetPasswordResponse> => {
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

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        throw new Error(error.message);
      });
    }

    return {
      status: 'success',
      message: t('Form.confirmResetPassword', { email: parsedData.email }),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('Errors.error') };
  }
};
