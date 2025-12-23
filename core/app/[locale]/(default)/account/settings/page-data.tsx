import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { FormFieldsFragment } from '~/data-transformers/form-field-transformer/fragment';

const AccountSettingsQuery = graphql(
  `
    query AccountSettingsQuery(
      $customerFilters: FormFieldFiltersInput
      $customerSortBy: FormFieldSortInput
      $addressFilters: FormFieldFiltersInput
      $addressSortBy: FormFieldSortInput
    ) {
      customer {
        entityId
        email
        firstName
        lastName
        company
        isSubscribedToNewsletter
      }
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
          newsletter {
            showNewsletterSignup
          }
        }
      }
    }
  `,
  [FormFieldsFragment],
);

type Variables = VariablesOf<typeof AccountSettingsQuery>;

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

export const getAccountSettingsQuery = cache(async ({ address, customer }: Props = {}) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: AccountSettingsQuery,
    variables: {
      addressFilters: address?.filters,
      addressSortBy: address?.sortBy,
      customerFilters: customer?.filters,
      customerSortBy: customer?.sortBy,
    },
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    customerAccessToken,
  });

  const addressFields = response.data.site.settings?.formFields.shippingAddress;
  const customerFields = response.data.site.settings?.formFields.customer;
  const customerInfo = response.data.customer;
  const newsletterSettings = response.data.site.settings?.newsletter;

  if (!addressFields || !customerFields || !customerInfo) {
    return null;
  }

  return {
    addressFields,
    customerFields,
    customerInfo,
    newsletterSettings,
  };
});
