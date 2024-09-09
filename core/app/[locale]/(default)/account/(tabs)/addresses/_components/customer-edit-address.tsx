import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';
import { FormFieldsFragment } from '~/components/form-fields/fragment';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { getCustomerAddresses } from '../page-data';

import { EditAddress as EditAddressForm } from './edit-address';

export const CustomerEditAdressQuery = graphql(
  `
    query CustomerEditAdressQuery(
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
              ...FormFieldsFragment
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
  [FormFieldsFragment],
);

export type EditAddressQueryResponseType = ResultOf<typeof CustomerEditAdressQuery>;

type CustomerAddresses = ExistingResultType<typeof getCustomerAddresses>;

export type Address = CustomerAddresses['addresses'][number];

export async function CustomerEditAddress({
  address,
  isAddressRemovable,
}: {
  address: Address;
  isAddressRemovable: boolean;
}) {
  const customerId = await getSessionCustomerId();

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
    <EditAddressForm
      address={address}
      addressFields={addressFields}
      countries={countries || []}
      isAddressRemovable={isAddressRemovable}
      reCaptchaSettings={bypassReCaptcha(reCaptchaSettings)}
    />
  );
}
