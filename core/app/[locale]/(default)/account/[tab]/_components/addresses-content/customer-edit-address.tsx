import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FORM_FIELDS_FRAGMENT } from '~/client/fragments/form-fields';
import { graphql, ResultOf } from '~/client/graphql';
import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';

import { EditAddress as EditAddressForm } from './edit-address';

export const CustomerEditAdressQuery = graphql(
  `
    query customerNewAddress(
      $countryCode: String
      $shippingFilters: FormFieldFiltersInput
      $shippingSorting: FormFieldSortInput
    ) {
      site {
        settings {
          contact {
            country
          }
          reCaptcha {
            isEnabledOnStorefront
            siteKey
          }
          formFields {
            shippingAddress(filters: $shippingFilters, sortBy: $shippingSorting) {
              ...FormFields
            }
          }
        }
      }
      geography {
        countries(filters: { code: $countryCode }) {
          __typename
          name
          entityId
          code
          statesOrProvinces {
            __typename
            entityId
            name
            abbreviation
          }
        }
      }
    }
  `,
  [FORM_FIELDS_FRAGMENT],
);

export type EditAddressQueryResponseType = ResultOf<typeof CustomerEditAdressQuery>;

type CustomerAddresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>;

export type Address = CustomerAddresses['addresses'][number];

export async function CustomerEditAddress({
  address,
  isAddressRemovable,
}: {
  address: Address;
  isAddressRemovable: boolean;
}) {
  const customerId = await getSessionCustomerId();
  const locale = await getLocale();
  const messages = await getMessages();

  const { data } = await client.fetch({
    document: CustomerEditAdressQuery,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      countryCode: null,
      shippingSorting: 'SORT_ORDER',
    },
  });
  const reCaptchaSettings = data.site.settings?.reCaptcha;
  const countries = data.geography.countries;
  const addressFields = [...(data.site.settings?.formFields.shippingAddress ?? [])];

  return (
    <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
      <EditAddressForm
        address={address}
        addressFields={addressFields}
        canBeDeleted={isAddressRemovable}
        countries={countries || []}
        reCaptchaSettings={reCaptchaSettings}
      />
    </NextIntlClientProvider>
  );
}
