import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { GalleryFragment } from '../../../product/[slug]/_components/gallery/fragment';

// Updated interfaces
interface ProductImage {
  url: string;
  altText: string | null;
}

interface ProductVariant {
  entityId: number;
  sku: string;
  defaultImage: ProductImage | null;
}

interface Product {
  entityId: number;
  name: string;
  sku: string;
  path: string;
  brand: {
    name: string;
    path: string;
  } | null;
  variants: {
    edges: Array<{
      node: ProductVariant;
    }> | null;
  };
  images: {
    edges: Array<{
      node: ProductImage;
    }> | null;
  };
  defaultImage: ProductImage | null;
  videos: {
    edges: Array<any> | null;
  };
  prices: any | null;
}

interface WishlistItem {
  entityId: number;
  product: Product;
}

interface WishlistEdgeNode {
  entityId: number;
  name: string;
  items: {
    edges: Array<{
      node: WishlistItem;
    }> | null;
  };
}

interface WishlistResponse {
  customer?: {
    wishlists: {
      pageInfo: any;
      edges: Array<{
        node: WishlistEdgeNode;
      }>;
    };
  };
}

interface GetWishlistsParams {
  limit?: number;
  before?: string;
  after?: string;
  filters?: WishlistsFiltersInput;
}

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
              items(first: 50) {
                edges {
                  node {
                    entityId
                    product {
                      entityId
                      name
                      sku
                      path
                      brand {
                        name
                        path
                      }
                      variants {
                        edges {
                          node {
                            entityId
                            sku
                            defaultImage {
                              url(width: 100)
                              altText
                            }
                          }
                        }
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

export const getWishlists = cache(
  async ({ limit = 3, before, after, filters }: GetWishlistsParams) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: WishlistsQuery,
      variables: { filters, ...paginationArgs },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });

    const data = response.data as WishlistResponse;

    if (!data?.customer) {
      return undefined;
    }

    return {
      pageInfo: data.customer.wishlists.pageInfo,
      wishlists: removeEdgesAndNodes(data.customer.wishlists).map((wishlist: WishlistEdgeNode) => ({
        ...wishlist,
        items: removeEdgesAndNodes(wishlist.items).map((item: WishlistItem) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images ? removeEdgesAndNodes(item.product.images) : [],
          },
        })),
      })),
    };
  },
);
