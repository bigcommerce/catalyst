'use server';

import { revalidatePath } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const DeleteStoredPaymentInstrumentMutation = graphql(`
  mutation DeleteStoredPaymentInstrumentMutation($input: DeleteStoredPaymentInstrumentInput!) {
    customer {
      deleteStoredPaymentInstrument(input: $input) {
        errors {
          message
        }
      }
    }
  }
`);

// DEMO: no error UI; failures surface through the Next.js error boundary.
export async function deleteStoredPaymentInstrument(formData: FormData) {
  const token = formData.get('token');

  if (typeof token !== 'string' || !token) {
    throw new Error('Missing stored payment instrument token');
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: DeleteStoredPaymentInstrumentMutation,
    variables: { input: { token } },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const errors = data.customer.deleteStoredPaymentInstrument?.errors ?? [];

  if (errors.length > 0) {
    throw new Error(
      `Failed to delete stored payment instrument: ${errors.map(({ message }) => message).join(', ')}`,
    );
  }

  revalidatePath('/[locale]/account/payment-methods', 'page');
}
