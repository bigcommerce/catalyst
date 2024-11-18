'use server';

import { expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { parseAccountFormData } from '~/components/form-fields/shared/parse-fields';

const AddCustomerAddressMutation = graphql(`
  mutation AddCustomerAddressMutation($input: AddCustomerAddressInput!) {
    customer {
      addCustomerAddress(input: $input) {
        errors {
          ... on CustomerAddressCreationError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on ValidationError {
            message
            path
          }
        }
        address {
          entityId
          firstName
          lastName
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof AddCustomerAddressMutation>;
type AddCustomerAddressInput = Variables['input'];

const isAddCustomerAddressInput = (data: unknown): data is AddCustomerAddressInput => {
  if (typeof data === 'object' && data !== null && 'address1' in data) {
    return true;
  }

  return false;
};

interface AddAddressResponse {
  status: 'success' | 'error';
  message: string;
}

export const addAddress = async (formData: FormData): Promise<AddAddressResponse> => {
  const t = await getTranslations('Account.Addresses.Add.Form');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const parsed = parseAccountFormData(formData);

    if (!isAddCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        message: t('Errors.inputError'),
      };
    }

    const response = await client.fetch({
      document: AddCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: parsed,
      },
    });

    const result = response.data.customer.addCustomerAddress;

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        // Throw the first error message, as we should only handle one error at a time
        throw new Error(error.message);
      });
    }

    expireTag(TAGS.customer);

    return { status: 'success', message: t('success') };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('Errors.error') };
  }
};
