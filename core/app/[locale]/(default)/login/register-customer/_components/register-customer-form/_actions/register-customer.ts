'use server';

import {
  Input,
  registerCustomer as registerCustomerClient,
} from '~/client/mutations/register-customer';

import { parseRegisterCustomerFormData } from '../fields/parse-fields';

interface RegisterCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

const isRegisterCustomerInput = (data: unknown): data is Input => {
  if (typeof data === 'object' && data !== null && 'email' in data && 'address' in data) {
    return true;
  }

  return false;
};

export const registerCustomer = async ({ formData, reCaptchaToken }: RegisterCustomerForm) => {
  formData.delete('customer-confirmPassword');

  const parsedData = parseRegisterCustomerFormData(formData);

  if (!isRegisterCustomerInput(parsedData)) {
    return {
      status: 'error',
      error: 'Something went wrong with proccessing user input',
    };
  }

  const response = await registerCustomerClient({
    formFields: parsedData,
    reCaptchaToken,
  });

  if (response.errors.length === 0) {
    return { status: 'success', data: parsedData };
  }

  return {
    status: 'error',
    error: response.errors.map((error) => error.message).join('\n'),
  };
};
