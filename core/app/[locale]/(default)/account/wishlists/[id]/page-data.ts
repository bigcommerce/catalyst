import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { WishlistPaginatedItemsFragment } from '~/components/wishlist/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

const WishlistDetailsQuery = graphql(
  `
    query WishlistDetailsQuery(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $entityId: Int!
      $currencyCode: currencyCode
    ) {
      customer {
        wishlists(filters: { entityIds: [$entityId] }) {
          edges {
            node {
              ...WishlistPaginatedItemsFragment
            }
          }
        }
      }
    }
  `,
  [WishlistPaginatedItemsFragment],
);

interface Pagination {
  limit: number;
  before: string | null;
  after: string | null;
}

export const getCustomerWishlist = cache(async (entityId: number, pagination: Pagination) => {
  const { before, after, limit = 9 } = pagination;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };
  const response = await client.fetch({
    document: WishlistDetailsQuery,
    variables: { ...paginationArgs, currencyCode, entityId },
    customerAccessToken,
    fetchOptions: { next: { revalidate, tags: [TAGS.customer] } },
  });

  const wishlist = response.data.customer?.wishlists.edges?.[0]?.node;

  if (!wishlist) {
    return null;
  }

  return wishlist;
});
