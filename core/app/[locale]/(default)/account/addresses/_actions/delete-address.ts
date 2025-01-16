import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { unstable_expireTag as expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { schema } from '@/vibes/soul/sections/address-list-section/schema';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { type State } from './address-action';

const DeleteCustomerAddressMutation = graphql(`
  mutation DeleteCustomerAddressMutation($input: DeleteCustomerAddressInput!) {
    customer {
      deleteCustomerAddress(input: $input) {
        errors {
          __typename
          ... on CustomerAddressDeletionError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`);

const stringToNumber = z.coerce.string().pipe(z.coerce.number());

const inputSchema = z.object({
  addressEntityId: stringToNumber,
});

function parseDeleteAddressInput(
  value: Record<string, unknown>,
): VariablesOf<typeof DeleteCustomerAddressMutation>['input'] {
  return inputSchema.parse({
    addressEntityId: value.id,
  });
}

export async function deleteAddress(prevState: Awaited<State>, formData: FormData): Promise<State> {
  const t = await getTranslations('Account.Addresses');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  try {
    const input = parseDeleteAddressInput(submission.value);

    const response = await client.fetch({
      document: DeleteCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input,
      },
    });

    const result = response.data.customer.deleteCustomerAddress;

    if (result.errors.length > 0) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    expireTag(TAGS.customer);

    return {
      addresses: prevState.addresses.filter(
        (address) => address.id !== String(submission.value.id),
      ),
      lastResult: submission.reply({ resetForm: true }),
      defaultAddress: prevState.defaultAddress,
      fields: prevState.fields,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('Errors.error')] }),
    };
  }
}
