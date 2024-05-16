import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FORM_FIELDS_FRAGMENT } from '~/client/fragments/form-fields';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const RegisterCustomerQuery = graphql(
  `
    query RegisterCustomerQuery(
      $customerFilters: FormFieldFiltersInput
      $customerSortBy: FormFieldSortInput
      $addressFilters: FormFieldFiltersInput
      $addressSortBy: FormFieldSortInput
    ) {
      site {
        settings {
          formFields {
            customer(filters: $customerFilters, sortBy: $customerSortBy) {
              ...FormFields
            }
            shippingAddress(filters: $addressFilters, sortBy: $addressSortBy) {
              ...FormFields
            }
          }
        }
        settings {
          contact {
            country
          }
          reCaptcha {
            isEnabledOnStorefront
            siteKey
          }
        }
      }
      geography {
        countries {
          code
          entityId
          name
          __typename
          statesOrProvinces {
            abbreviation
            entityId
            name
            __typename
          }
        }
      }
    }
  `,
  [FORM_FIELDS_FRAGMENT],
);

type Variables = VariablesOf<typeof RegisterCustomerQuery>;

interface Props {
  address?: {
    filters?: Variables['addressFilters'];
    sortBy?: Variables['addressSortBy'];
  };

  customer?: {
    filters?: Variables['customerFilters'];
    sortBy?: Variables['customerSortBy'];
  };
}

export const getRegisterCustomerQuery = cache(async ({ address, customer }: Props = {}) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: RegisterCustomerQuery,
    variables: {
      addressFilters: address?.filters,
      addressSortBy: address?.sortBy,
      customerFilters: customer?.filters,
      customerSortBy: customer?.sortBy,
    },
    fetchOptions: { next: { revalidate } },
    customerId,
  });

  const addressFields = response.data.site.settings?.formFields.shippingAddress;
  const customerFields = response.data.site.settings?.formFields.customer;

  const countries = response.data.geography.countries;
  const defaultCountry = response.data.site.settings?.contact?.country;

  const reCaptchaSettings = response.data.site.settings?.reCaptcha;

  if (!addressFields || !customerFields || !countries) {
    return null;
  }

  return {
    addressFields,
    customerFields,
    countries,
    defaultCountry,
    reCaptchaSettings,
  };
});
