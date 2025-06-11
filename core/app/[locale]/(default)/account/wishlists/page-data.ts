import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { WishlistsFragment } from '~/components/wishlist/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

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

export const getCustomerWishlists = cache(async ({ limit = 9, before, after }: Pagination) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };
  const response = await client.fetch({
    document: WishlistsPageQuery,
    variables: { ...paginationArgs, currencyCode },
    customerAccessToken,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
  });

  const wishlists = response.data.customer?.wishlists;

  if (!wishlists) {
    return null;
  }

  return wishlists;
});
