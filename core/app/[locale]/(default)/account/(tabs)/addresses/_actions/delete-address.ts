'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

import { State } from '../../settings/change-password/_actions/change-password';
import { Addresses } from '../_components/address-book';
import { SearchParams } from '../page';
import { getCustomerAddresses } from '../page-data';

interface DeleteAddressResponse extends State {
  addresses?: Addresses;
}

const DeleteCustomerAddressMutation = graphql(`
  mutation DeleteCustomerAddressMutation(
    $reCaptcha: ReCaptchaV2Input
    $input: DeleteCustomerAddressInput!
  ) {
    customer {
      deleteCustomerAddress(reCaptchaV2: $reCaptcha, input: $input) {
        errors {
          __typename
          ... on CustomerAddressDeletionError {
            __typename
            message
          }
          ... on CustomerNotLoggedInError {
            __typename
            message
          }
        }
      }
    }
  }
`);

export const deleteAddress = async (
  addressId: number,
  searchParams?: SearchParams,
): Promise<DeleteAddressResponse> => {
  const t = await getTranslations('Account.Addresses.Delete');
  const customerAccessToken = await getSessionCustomerAccessToken();
  const { before, after } = searchParams || {};

  try {
    const response = await client.fetch({
      document: DeleteCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: {
          addressEntityId: addressId,
        },
      },
    });

    const result = response.data.customer.deleteCustomerAddress;

    revalidatePath('/account/addresses', 'page');

    if (result.errors.length === 0) {
      const updatedData = await getCustomerAddresses({
        ...(after && { after }),
        ...(before && { before }),
      });

      return {
        status: 'success',
        message: t('success'),
        addresses: updatedData?.addresses || [],
      };
    }

    return {
      status: 'error',
      message: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('error') };
  }
};
