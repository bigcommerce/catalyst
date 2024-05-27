'use server';

import { revalidatePath } from 'next/cache';

import { deleteCustomerAddress } from '~/client/mutations/delete-customer-address';

import { State } from './submit-customer-change-password-form';

export const deleteAddress = async (addressId: number): Promise<State> => {
  try {
    const response = await deleteCustomerAddress(addressId);

    revalidatePath('/account/addresses', 'page');

    if (response.errors.length === 0) {
      return { status: 'success', message: 'Address deleted from your account.' };
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
