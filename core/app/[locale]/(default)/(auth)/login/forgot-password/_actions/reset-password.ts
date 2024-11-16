'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

const processZodErrors = (err: z.ZodError) => {
  const { fieldErrors, formErrors } = err.flatten((issue: z.ZodIssue) => ({
    message: issue.message,
  }));

  if (formErrors.length > 0) {
    return formErrors.map(({ message }) => message);
  }

  return Object.entries(fieldErrors).flatMap(([, errorList]) => {
    return errorList?.map(({ message }) => message) ?? [''];
  });
};

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
      errors: result.errors.map((error) => error.message),
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        status: 'error',
        errors: processZodErrors(error),
      };
    }

    if (error instanceof Error) {
      return { status: 'error', errors: [error.message] };
    }

    return { status: 'error', errors: [t('Errors.error')] };
  }
};
