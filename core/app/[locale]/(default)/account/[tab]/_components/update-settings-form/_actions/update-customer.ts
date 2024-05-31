'use server';

import { revalidatePath } from 'next/cache';

import { parseAccountFormData } from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields/parse-fields';
import {
  Input as AddCustomerAddressInput,
  updateCustomer as updateCustomerClient,
} from '~/client/mutations/update-customer';

const isUpdateCustomerInput = (data: unknown): data is AddCustomerAddressInput => {
  if (
    typeof data === 'object' &&
    data !== null &&
    ('firstName' in data ||
      'lastName' in data ||
      'email' in data ||
      'phone' in data ||
      'company' in data ||
      'formFields' in data)
  ) {
    return true;
  }

  return false;
};

interface UpdateCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

export const updateCustomer = async ({ formData, reCaptchaToken }: UpdateCustomerForm) => {
  formData.delete('g-recaptcha-response');

  const parsed = parseAccountFormData(formData);

  if (!isUpdateCustomerInput(parsed)) {
    return {
      status: 'error',
      error: 'Something went wrong with proccessing user input.',
    };
  }

  const response = await updateCustomerClient({ formFields: parsed, reCaptchaToken });

  revalidatePath('/account/settings', 'page');

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
