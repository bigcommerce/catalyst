'use server';

import { revalidatePath } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/navigation-server';

const UpdateStoredPaymentInstrumentMutation = graphql(`
  mutation UpdateStoredPaymentInstrumentMutation($input: UpdateStoredPaymentInstrumentInput!) {
    customer {
      updateStoredPaymentInstrument(input: $input) {
        errors {
          message
        }
      }
    }
  }
`);

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

// DEMO: no error UI; failures surface through the Next.js error boundary.
export async function updateBillingAddress(formData: FormData) {
  const token = getString(formData, 'token');
  const locale = getString(formData, 'locale') ?? 'en';
  const firstName = getString(formData, 'firstName');
  const address1 = getString(formData, 'address1');
  const city = getString(formData, 'city');
  const countryCode = getString(formData, 'countryCode');

  if (!token || !firstName || !address1 || !city || !countryCode) {
    throw new Error('Missing required billing address fields');
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: UpdateStoredPaymentInstrumentMutation,
    variables: {
      input: {
        token,
        billingAddress: {
          firstName,
          lastName: getString(formData, 'lastName'),
          email: getString(formData, 'email'),
          company: getString(formData, 'company'),
          address1,
          address2: getString(formData, 'address2'),
          city,
          stateOrProvince: getString(formData, 'stateOrProvince'),
          stateOrProvinceCode: getString(formData, 'stateOrProvinceCode'),
          postalCode: getString(formData, 'postalCode'),
          countryCode,
          phone: getString(formData, 'phone'),
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const errors = data.customer.updateStoredPaymentInstrument?.errors ?? [];

  if (errors.length > 0) {
    throw new Error(
      `Failed to update stored payment instrument: ${errors.map(({ message }) => message).join(', ')}`,
    );
  }

  revalidatePath('/[locale]/account/payment-methods', 'page');

  return await redirect({ href: '/account/payment-methods', locale });
}
