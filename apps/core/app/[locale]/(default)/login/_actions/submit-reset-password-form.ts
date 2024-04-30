'use server';

import { z } from 'zod';

import { ResetPasswordSchema, submitResetPassword } from '~/client/mutations/submit-reset-password';

interface SubmitResetPasswordForm {
  formData: FormData;
  path: string;
  reCaptchaToken: string;
}

export const submitResetPasswordForm = async ({
  formData,
  path,
  reCaptchaToken,
}: SubmitResetPasswordForm) => {
  try {
    const parsedData = ResetPasswordSchema.parse({
      email: formData.get('email'),
    });

    const response = await submitResetPassword({
      email: parsedData.email,
      path,
      reCaptchaToken,
    });

    if (response.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'error',
      error: response.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Unknown error.' };
  }
};
