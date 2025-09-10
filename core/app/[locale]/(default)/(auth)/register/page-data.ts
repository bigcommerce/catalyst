import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { FormFieldsFragment } from '~/data-transformers/form-field-transformer/fragment';

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
              ...FormFieldsFragment
            }
            shippingAddress(filters: $addressFilters, sortBy: $addressSortBy) {
              ...FormFieldsFragment
            }
          }
        }
      }
      geography {
        countries {
          code
          name
        }
      }
    }
  `,
  [FormFieldsFragment],
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

export const getRegisterCustomerQuery = cache(async ({ address, customer }: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: RegisterCustomerQuery,
    variables: {
      addressFilters: address?.filters,
      addressSortBy: address?.sortBy,
      customerFilters: customer?.filters,
      customerSortBy: customer?.sortBy,
    },
    fetchOptions: { cache: 'no-store' },
    customerAccessToken,
  });

  const addressFields = response.data.site.settings?.formFields.shippingAddress;
  const customerFields = response.data.site.settings?.formFields.customer;
  const countries = response.data.geography.countries;

  if (!addressFields || !customerFields) {
    return null;
  }

  return {
    addressFields,
    customerFields,
    countries,
  };
});
