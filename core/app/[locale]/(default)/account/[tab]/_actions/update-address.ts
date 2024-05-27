'use server';

import { revalidatePath } from 'next/cache';

import {
  updateCustomerAddress,
  UpdateCustomerAddressInput,
} from '~/client/mutations/update-customer-address';

const isUpdateCustomerAddressInput = (
  data: unknown,
): data is UpdateCustomerAddressInput['data'] => {
  if (typeof data === 'object' && data !== null && 'address1' in data) {
    return true;
  }

  return false;
};

export const updateAddress = async ({
  addressId,
  formData,
  reCaptchaToken,
}: {
  addressId: number;
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

    if (!isUpdateCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        error: 'Something went wrong with proccessing user input.',
      };
    }

    const response = await updateCustomerAddress({
      input: {
        addressEntityId: addressId,
        data: parsed,
      },
      reCaptchaToken,
    });

    revalidatePath('/account/addresses', 'page');

    if (response.errors.length === 0) {
      return { status: 'success', message: 'The address has been updated.' };
    }

    return {
      status: 'error',
      message: response.errors
        .map((error) => {
          if (error.__typename === 'AddressDoesNotExistError') {
            return 'Address does not exist.';
          }

          return error.message;
        })
        .join('\n'),
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
