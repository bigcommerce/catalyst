'use server';

import { updateCustomer as updateCustomerClient } from '~/client/mutations/update-customer';

interface UpdateCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

export const updateCustomer = async ({ formData, reCaptchaToken }: UpdateCustomerForm) => {
  formData.delete('g-recaptcha-response');

  const formFields = Object.fromEntries(formData.entries());

  const response = await updateCustomerClient({ formFields, reCaptchaToken });

  if (response.errors.length === 0) {
    const { customer } = response;

    if (!customer) {
      return {
        status: 'error',
        error: 'Customer does not exist',
      };
    }

    const { firstName, lastName } = customer;

    return { status: 'success', data: { firstName, lastName } };
  }

  return {
    status: 'error',
    error: response.errors.map((error) => error.message).join('\n'),
  };
};
