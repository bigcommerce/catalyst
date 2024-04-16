import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const GET_CUSTOMER_ADDRESSES_QUERY = graphql(`
  query getCustomerAddresses($after: String, $before: String, $first: Int, $last: Int) {
    customer {
      entityId
      addresses(before: $before, after: $after, first: $first, last: $last) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
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
          }
        }
      }
    }
  }
`);

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
      document: GET_CUSTOMER_ADDRESSES_QUERY,
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
