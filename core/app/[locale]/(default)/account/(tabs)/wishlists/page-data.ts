import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';

import { GalleryFragment } from '../../../product/[slug]/_components/gallery/fragment';

const WishlistQuery = graphql(
  `
    query WishlistQuery(
      $filters: WishlistFiltersInput
      $after: String
      $before: String
      $first: Int
      $last: Int
    ) {
      customer {
        wishlists(filters: $filters) {
          edges {
            node {
              entityId
              name
              items(after: $after, before: $before, first: $first, last: $last) {
                pageInfo {
                  ...PaginationFragment
                }
                edges {
                  node {
                    entityId
                    product {
                      ...GalleryFragment
                      ...ProductCardFragment
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [GalleryFragment, PaginationFragment, ProductCardFragment],
);

export const getWishlist = cache(async ({ limit = 8, before, after, filters }: GetWishlists) => {
  const customerId = await getSessionCustomerId();
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const response = await client.fetch({
    document: WishlistQuery,
    variables: { filters, ...paginationArgs },
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const { customer } = response.data;

  if (!customer) {
    return undefined;
  }

  return {
    wishlists: removeEdgesAndNodes(customer.wishlists).map((wishlist) => {
      return {
        ...wishlist,
        items: removeEdgesAndNodes(wishlist.items).map((item) => {
          return {
            ...item,
            product: {
              ...item.product,
              images: removeEdgesAndNodes(item.product.images),
            },
          };
        }),
        pageInfo: wishlist.items.pageInfo,
      };
    }),
  };
});

const WishlistsQuery = graphql(
  `
    query WishlistsQuery(
      $filters: WishlistFiltersInput
      $after: String
      $before: String
      $first: Int
      $last: Int
    ) {
      customer {
        wishlists(filters: $filters, after: $after, before: $before, first: $first, last: $last) {
          pageInfo {
            ...PaginationFragment
          }
          edges {
            node {
              entityId
              name
              items {
                edges {
                  node {
                    entityId
                    product {
                      entityId
                      name
                      path
                      brand {
                        name
                        path
                      }
                      ...GalleryFragment
                      ...PricingFragment
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [GalleryFragment, PaginationFragment, PricingFragment],
);

type WishlistsVariables = VariablesOf<typeof WishlistsQuery>;
type WishlistsFiltersInput = WishlistsVariables['filters'];

interface GetWishlists {
  limit?: number;
  before?: string;
  after?: string;
  filters?: WishlistsFiltersInput;
}

export const getWishlists = cache(async ({ limit = 3, before, after, filters }: GetWishlists) => {
  const customerId = await getSessionCustomerId();
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const response = await client.fetch({
    document: WishlistsQuery,
    variables: { filters, ...paginationArgs },
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const { customer } = response.data;

  if (!customer) {
    return undefined;
  }

  return {
    pageInfo: customer.wishlists.pageInfo,
    wishlists: removeEdgesAndNodes(customer.wishlists).map((wishlist) => {
      return {
        ...wishlist,
        items: removeEdgesAndNodes(wishlist.items).map((item) => {
          return {
            ...item,
            product: {
              ...item.product,
              images: removeEdgesAndNodes(item.product.images),
            },
          };
        }),
      };
    }),
  };
});
