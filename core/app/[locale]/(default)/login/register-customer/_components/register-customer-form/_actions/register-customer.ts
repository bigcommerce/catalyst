'use server';

import {
  Input,
  registerCustomer as registerCustomerClient,
} from '~/client/mutations/register-customer';

interface RegisterCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

const isRegisterCustomerInput = (data: unknown): data is Input => {
  if (typeof data === 'object' && data !== null && 'email' in data) {
    return true;
  }

  return false;
};

export const registerCustomer = async ({ formData, reCaptchaToken }: RegisterCustomerForm) => {
  formData.delete('customer-confirmPassword');

  const parsedData = Array.from(formData.entries()).reduce<{
    [key: string]: FormDataEntryValue | Record<string, FormDataEntryValue>;
    address: Record<string, FormDataEntryValue>;
  }>(
    (acc, [name, value]) => {
      const key = name.split('-').at(-1) ?? '';
      const sections = name.split('-').slice(0, -1);

      if (sections.includes('customer')) {
        acc[key] = value;
      }

      if (sections.includes('address')) {
        acc.address[key] = value;
      }

      return acc;
    },
    { address: {} },
  );

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
