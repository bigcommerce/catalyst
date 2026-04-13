import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import type { CurrencyCode } from '~/components/header/fragment';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { WishlistItemFragment } from '~/components/wishlist/fragment';

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

async function getCachedPublicWishlist(
  locale: string,
  token: string,
  pagination: Pagination,
  currencyCode?: CurrencyCode,
) {
  'use cache';

  cacheLife({ revalidate });
  cacheTag(TAGS.customer);

  const { before, after, limit = 9 } = pagination;
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };
  const response = await client.fetch({
    document: PublicWishlistQuery,
    variables: { ...paginationArgs, currencyCode, token },
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  const wishlist = response.data.site.publicWishlist;

  return wishlist;
}

export const getPublicWishlist = cache(
  async (locale: string, token: string, pagination: Pagination, currencyCode?: CurrencyCode) => {
    return getCachedPublicWishlist(locale, token, pagination, currencyCode);
  },
);
