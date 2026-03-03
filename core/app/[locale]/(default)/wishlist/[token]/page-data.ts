import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { WishlistItemFragment } from '~/components/wishlist/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

const PublicWishlistQuery = graphql(
  `
    query PublicWishlistQuery(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $token: String!
      $currencyCode: currencyCode
    ) {
      site {
        publicWishlist(token: $token) {
          entityId
          name
          token
          items(first: $first, after: $after, last: $last, before: $before) {
            edges {
              node {
                ...WishlistItemFragment
              }
            }
            pageInfo {
              ...PaginationFragment
            }
            collectionInfo {
              totalItems
            }
          }
        }
      }
    }
  `,
  [WishlistItemFragment, ProductCardFragment, PaginationFragment],
);

interface Pagination {
  limit?: number;
  before?: string | null;
  after?: string | null;
}

const getCachedPublicWishlist = unstable_cache(
  async (
    _locale: string,
    token: string,
    pagination: Pagination,
    currencyCode: string | undefined,
  ) => {
    const { before, after, limit = 9 } = pagination;
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };
    const response = await client.fetch({
      document: PublicWishlistQuery,
      variables: { ...paginationArgs, currencyCode, token },
      fetchOptions: { cache: 'no-store' },
    });

    const wishlist = response.data.site.publicWishlist;

    if (!wishlist) {
      return null;
    }

    return wishlist;
  },
  ['get-public-wishlist'],
  { revalidate, tags: [TAGS.customer] },
);

export const getPublicWishlist = cache(async (token: string, pagination: Pagination) => {
  const currencyCode = await getPreferredCurrencyCode();
  const locale = await getLocale();

  return getCachedPublicWishlist(locale, token, pagination, currencyCode);
});
