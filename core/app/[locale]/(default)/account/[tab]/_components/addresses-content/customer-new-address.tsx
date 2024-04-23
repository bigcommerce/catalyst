import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FORM_FIELDS_FRAGMENT } from '~/client/fragments/form-fields';
import { graphql, ResultOf } from '~/client/graphql';

import { AddAddress as AddAddressForm } from './add-address';

const CustomerNewAdressQuery = graphql(
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

export type NewAddressQueryResponseType = ResultOf<typeof CustomerNewAdressQuery>;

const FALLBACK_COUNTRY = {
  entityId: 226,
  name: 'United States',
  code: 'US',
  states: [],
};

export async function CustomerNewAddress() {
  const customerId = await getSessionCustomerId();
  const locale = await getLocale();
  const messages = await getMessages();
  const { data } = await client.fetch({
    document: CustomerNewAdressQuery,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      shippingSorting: 'SORT_ORDER',
    },
  });

  const addressFields = [...(data.site.settings?.formFields.shippingAddress ?? [])];
  const reCaptchaSettings = data.site.settings?.reCaptcha;
  const countries = data.geography.countries;
  const defaultCountry = data.site.settings?.contact?.country || FALLBACK_COUNTRY.name;

  const {
    code = FALLBACK_COUNTRY.code,
    entityId = FALLBACK_COUNTRY.entityId,
    statesOrProvinces: defaultCountryStates = FALLBACK_COUNTRY.states,
  } = countries?.find(({ name: country }) => country === defaultCountry) || {};

  return (
    <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
      <AddAddressForm
        addressFields={addressFields}
        countries={countries || []}
        defaultCountry={{ id: entityId, code, states: defaultCountryStates }}
        reCaptchaSettings={reCaptchaSettings}
      />
    </NextIntlClientProvider>
  );
}
