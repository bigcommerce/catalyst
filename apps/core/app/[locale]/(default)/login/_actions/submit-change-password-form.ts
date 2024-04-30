'use server';

import { ZodError } from 'zod';

import {
  ChangePasswordSchema,
  submitChangePassword,
} from '~/client/mutations/submit-change-password';

export const submitChangePasswordForm = async (_previousState: unknown, formData: FormData) => {
  try {
    const parsedData = ChangePasswordSchema.parse({
      customerId: formData.get('customer-id'),
      customerToken: formData.get('customer-token'),
      newPassword: formData.get('new-password'),
      confirmPassword: formData.get('confirm-password'),
    });

    const response = await submitChangePassword({
      newPassword: parsedData.newPassword,
      token: parsedData.customerToken,
      customerEntityId: Number(parsedData.customerId),
    });

    if (response.errors.length === 0) {
      return { status: 'success', message: '' };
    }

    return {
      status: 'error',
      message: response.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
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

    return { status: 'error', message: 'Unknown error.' };
  }
};
