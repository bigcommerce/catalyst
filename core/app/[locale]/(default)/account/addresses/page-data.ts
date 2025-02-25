import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { doNotCachePolicyWithEntityTags, TAGS } from "~/client/cache-policy";
import {
  FormFieldsFragment,
  FormFieldValuesFragment,
} from '~/data-transformers/form-field-transformer/fragment';

const GetCustomerAddressesQuery = graphql(
  `
    query GetCustomerAddressesQuery($after: String, $before: String, $first: Int, $last: Int) {
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
      site {
        settings {
          formFields {
            shippingAddress {
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
  [PaginationFragment, FormFieldValuesFragment, FormFieldsFragment],
);

interface Pagination {
  after?: string;
  before?: string;
  limit?: number;
}

export const getCustomerAddresses = cache(
  async ({ before = '', after = '', limit = 10 }: Pagination) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: GetCustomerAddressesQuery,
      variables: { ...paginationArgs },
      customerAccessToken,
      fetchOptions: doNotCachePolicyWithEntityTags({ entityType: TAGS.customer }),
    });

    const addresses = response.data.customer?.addresses;

    if (!addresses) {
      return undefined;
    }

    return {
      pageInfo: addresses.pageInfo,
      totalAddresses: addresses.collectionInfo?.totalItems ?? 0,
      addresses: removeEdgesAndNodes({ edges: addresses.edges }),
      shippingAddressFields: response.data.site.settings?.formFields.shippingAddress,
      countries: response.data.geography.countries,
    };
  },
);
