import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import type { CurrencyCode } from '~/components/header/fragment';
import { WishlistsFragment } from '~/components/wishlist/fragment';

const WishlistsPageQuery = graphql(
  `
    query WishlistsPageQuery(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $filters: WishlistFiltersInput
      $currencyCode: currencyCode
    ) {
      customer {
        wishlists(first: $first, after: $after, last: $last, before: $before, filters: $filters) {
          ...WishlistsFragment
        }
      }
    }
  `,
  [WishlistsFragment],
);

interface Pagination {
  limit: number;
  before: string | null;
  after: string | null;
}

export const getCustomerWishlists = cache(
  async (
    locale: string,
    { limit = 9, before, after }: Pagination,
    customerAccessToken?: string,
    currencyCode?: CurrencyCode,
  ) => {
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };
    const response = await client.fetch({
      document: WishlistsPageQuery,
      variables: { ...paginationArgs, currencyCode },
      locale,
      customerAccessToken,
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    });

    const wishlists = response.data.customer?.wishlists;

    if (!wishlists) {
      return null;
    }

    return wishlists;
  },
);
