'use server';

import { ZodError } from 'zod';

import {
  CustomerChangePasswordSchema,
  submitCustomerChangePassword,
} from '~/client/mutations/submit-customer-change-password';

export interface State {
  status: 'idle' | 'error' | 'success';
  message?: string;
}

export const submitCustomerChangePasswordForm = async (
  _previousState: unknown,
  formData: FormData,
) => {
  try {
    const parsedData = CustomerChangePasswordSchema.parse({
      newPassword: formData.get('new-password'),
      currentPassword: formData.get('current-password'),
      confirmPassword: formData.get('confirm-password'),
    });

    const response = await submitCustomerChangePassword({
      newPassword: parsedData.newPassword,
      currentPassword: parsedData.currentPassword,
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

    return { status: 'error', message: 'Unknown error' };
  }
};
