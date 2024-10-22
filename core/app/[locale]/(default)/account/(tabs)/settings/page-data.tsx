import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FormFieldValuesFragment } from '~/client/fragments/form-fields-values';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, VariablesOf } from '~/client/graphql';
import { FormFieldsFragment } from '~/components/form-fields/fragment';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

const CustomerSettingsQuery = graphql(
  `
    query CustomerSettingsQuery(
      $customerFilters: FormFieldFiltersInput
      $customerSortBy: FormFieldSortInput
      $addressFilters: FormFieldFiltersInput
      $addressSortBy: FormFieldSortInput
    ) {
      customer {
        entityId
        company
        email
        firstName
        lastName
        phone
        formFields {
          entityId
          name
          __typename
          ... on CheckboxesFormFieldValue {
            valueEntityIds
            values
          }
          ... on DateFormFieldValue {
            date {
              utc
            }
          }
          ... on MultipleChoiceFormFieldValue {
            valueEntityId
            value
          }
          ... on NumberFormFieldValue {
            number
          }
          ... on PasswordFormFieldValue {
            password
          }
          ... on TextFormFieldValue {
            text
          }
          ... on MultilineTextFormFieldValue {
            multilineText
          }
        }
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
          reCaptcha {
            isEnabledOnStorefront
            siteKey
          }
        }
      }
    }
  `,
  [FormFieldsFragment],
);

type Variables = VariablesOf<typeof CustomerSettingsQuery>;

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

export const getCustomerSettingsQuery = cache(async ({ address, customer }: Props = {}) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CustomerSettingsQuery,
    variables: {
      addressFilters: address?.filters,
      addressSortBy: address?.sortBy,
      customerFilters: customer?.filters,
      customerSortBy: customer?.sortBy,
    },
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const addressFields = response.data.site.settings?.formFields.shippingAddress;
  const customerFields = response.data.site.settings?.formFields.customer;
  const customerInfo = response.data.customer;

  const reCaptchaSettings = await bypassReCaptcha(response.data.site.settings?.reCaptcha);

  if (!addressFields || !customerFields || !customerInfo) {
    return null;
  }

  return {
    addressFields,
    customerFields,
    customerInfo,
    reCaptchaSettings,
  };
});

const GetCustomerAddressesQuery = graphql(
  `
    query GetCustomerAddresses($after: String, $before: String, $first: Int, $last: Int) {
      customer {
        entityId
        addresses(before: $before, after: $after, first: $first, last: $last) {
          pageInfo {
            ...PaginationFragment
          }
          collectionInfo {
            totalItems
          }
          edges {
            node {
              entityId
              firstName
              lastName
              address1
              address2
              city
              stateOrProvince
              countryCode
              phone
              postalCode
              company
              formFields {
                ...FormFieldValuesFragment
              }
            }
          }
        }
      }
    }
  `,
  [PaginationFragment, FormFieldValuesFragment],
);

export interface CustomerAddressesArgs {
  after?: string;
  before?: string;
  limit?: number;
}

export const getCustomerAddresses = cache(
  async ({ before = '', after = '', limit = 9 }: CustomerAddressesArgs) => {
    const customerId = await getSessionCustomerId();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: GetCustomerAddressesQuery,
      variables: { ...paginationArgs },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const addresses = response.data.customer?.addresses;

    if (!addresses) {
      return undefined;
    }

    return {
      pageInfo: addresses.pageInfo,
      addressesCount: addresses.collectionInfo?.totalItems ?? 0,
      addresses: removeEdgesAndNodes({ edges: addresses.edges }),
    };
  },
);
