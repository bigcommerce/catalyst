'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const logins = async (
  email: string | number | null | undefined,
  password: string | number | null | undefined,
  formData: FormData,
) => {
  try {
    // Extract form data inputs
    const email = formData.get('customer-email') as string | null;
    const password = formData.get('customer-password') as string | null;
    const phone = formData.get('phone') as string | null;

    // Prepare credentials object, giving priority to phone number if email and password are not provided
    const credentials = Credentials.parse({
      email: email || phone || '', // Use phone number as email-like input if email is empty
      password: password || phone || '', // Use phone number as password-like input if password is empty
    });

    // Attempt sign-in with the constructed credentials
    await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    // Redirect to account page upon successful login
    redirect('/account');
  } catch (error: unknown) {
    // Handle redirection errors
    if (isRedirectError(error)) {
      throw error;
    }

    // If login fails, return error status
    return {
      status: 'error',
      message: 'Login failed. Please try again with valid credentials.',
    };
  }
};