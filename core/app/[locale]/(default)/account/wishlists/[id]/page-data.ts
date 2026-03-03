import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import type { CurrencyCode } from '~/components/header/fragment';
import { WishlistPaginatedItemsFragment } from '~/components/wishlist/fragment';

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

export const getCustomerWishlist = cache(
  async (
    locale: string,
    entityId: number,
    pagination: Pagination,
    customerAccessToken?: string,
    currencyCode?: CurrencyCode,
  ) => {
    const { before, after, limit = 9 } = pagination;
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };
    const response = await client.fetch({
      document: WishlistDetailsQuery,
      variables: { ...paginationArgs, currencyCode, entityId },
      locale,
      customerAccessToken,
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    });

    const wishlist = response.data.customer?.wishlists.edges?.[0]?.node;

    if (!wishlist) {
      return null;
    }

    return wishlist;
  },
);
