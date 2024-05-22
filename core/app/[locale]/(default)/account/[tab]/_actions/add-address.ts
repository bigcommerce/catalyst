'use server';

import { revalidatePath } from 'next/cache';

import {
  addCustomerAddress,
  AddCustomerAddressInput,
} from '~/client/mutations/add-customer-address';

const isAddCustomerAddressInput = (data: unknown): data is AddCustomerAddressInput => {
  if (typeof data === 'object' && data !== null && 'address1' in data) {
    return true;
  }

  return false;
};

export const addAddress = async ({
  formData,
  reCaptchaToken,
}: {
  formData: FormData;
  reCaptchaToken?: string;
}) => {
  try {
    const parsed: unknown = [...formData.entries()].reduce<
      Record<string, FormDataEntryValue | Record<string, FormDataEntryValue>>
    >((parsedData, [name, value]) => {
      const key = name.split('-').at(-1) ?? '';
      const sections = name.split('-').slice(0, -1);

      if (sections.includes('customer')) {
        parsedData[key] = value;
      }

      if (sections.includes('address')) {
        parsedData[key] = value;
      }

      return parsedData;
    }, {});

    if (!isAddCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        error: 'Something went wrong with proccessing user input.',
      };
    }

    const response = await addCustomerAddress({
      input: parsed,
      reCaptchaToken,
    });

    revalidatePath('/account/addresses', 'page');

    if (response.errors.length === 0) {
      return { status: 'success', message: 'The address has been added.' };
    }

    return {
      status: 'error',
      message: response.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: 'Unknown error.' };
  }
};
