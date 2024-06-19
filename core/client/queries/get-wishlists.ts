import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const GET_WISHLISTS_QUERY = graphql(`
  query WishlistQuery {
    customer {
      wishlists {
        edges {
          node {
            name
            entityId
            items {
              edges {
                node {
                  product {
                    name
                    entityId
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getWishlists = cache(async () => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_WISHLISTS_QUERY,
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const { customer } = response.data;

  if (!customer) {
    return undefined;
  }

  return removeEdgesAndNodes(customer.wishlists).map((wishlist) => ({
    ...wishlist,
    items: removeEdgesAndNodes(wishlist.items),
  }));
});
