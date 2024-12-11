'use server';

import { expirePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
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

export const addAddress = async (formData: FormData) => {
  const t = await getTranslations('Account.Addresses.Add.Form');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const parsed = parseAccountFormData(formData);

    if (!isAddCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        errors: [t('Errors.inputError')],
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

    expirePath('/account/addresses', 'page');

    if (result.errors.length === 0) {
      return { status: 'success', messages: [t('success')] };
    }

    return {
      status: 'error',
      messages: result.errors.map((error) => error.message),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        messages: [error.message],
      };
    }

    return { status: 'error', messages: [t('Errors.error')] };
  }
};
