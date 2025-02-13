import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, VariablesOf } from '~/client/graphql';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';
import { revalidate } from '~/client/revalidate-target';

interface Price {
  value: number;
  currencyCode: string;
}

interface PriceData {
  price: Price;
  basePrice: Price;
  salePrice: Price | null;
}

interface OptionValue {
  entityId: number;
  label: string;
}

interface VariantOption {
  displayName: string;
  entityId: number;
  isRequired: boolean;
  values: {
    edges: Array<{
      node: OptionValue;
    }>;
  };
}

interface ProductVariant {
  entityId: number;
  sku: string;
  mpn?: string;
  options: {
    edges: Array<{
      node: VariantOption;
    }>;
  };
  defaultImage?: {
    url: string;
    altText: string;
  };
  prices?: PriceData;
}
interface Brand {
  entityId: number;
  name: string;
  path: string;
}
interface Product {
  entityId: number;
  name: string;
  sku: string;
  mpn?: string;
  path: string;
  brand: Brand;
  defaultImage: {
    url: string;
    altText: string;
  };
  reviewSummary?: {
    numberOfReviews: string;
    averageRating: string;
  };
  categories?: {
    edges: Array<{
      node: {
        entityId: number;
        name: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  prices: PriceData;
}

interface WishlistItem {
  entityId: number;
  productEntityId: number;
  variantEntityId: number;
  product: Product;
}

interface WishlistEdgeNode {
  entityId: number;
  name: string;
  items: {
    edges: Array<{
      node: WishlistItem;
    }>;
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

const ReviewSummaryFragment = graphql(`
  fragment ReviewSummaryFragment on Product {
    reviewSummary {
      numberOfReviews
      averageRating
    }
  }
`);

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
                    productEntityId
                    variantEntityId

                    product {
                      entityId
                      brand {
                        entityId
                        name
                        path
                      }
                      categories {
                        edges {
                          node {
                            entityId
                            name
                            ...BreadcrumbsFragment
                          }
                        }
                      }
                      availabilityV2 {
                        status
                        description
                      }
                      name
                      sku
                      mpn
                      path

                      ...ReviewSummaryFragment
                      variants {
                        edges {
                          node {
                            entityId
                            sku
                            mpn
                            options {
                              edges {
                                node {
                                  displayName
                                  entityId
                                  isRequired
                                }
                              }
                            }
                            defaultImage {
                              url(width: 100)
                              altText
                            }
                            prices {
                              price {
                                value
                                currencyCode
                              }
                              basePrice {
                                value
                                currencyCode
                              }
                              salePrice {
                                value
                                currencyCode
                              }
                            }
                          }
                        }
                      }
                      defaultImage {
                        url(width: 300)
                        altText
                      }
                      prices {
                        price {
                          value
                          currencyCode
                        }
                        basePrice {
                          value
                          currencyCode
                        }
                        salePrice {
                          value
                          currencyCode
                        }
                      }
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
  [PaginationFragment, BreadcrumbsFragment, ReviewSummaryFragment],
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
      customerAccessToken,
      fetchOptions: customerAccessToken
        ? { cache: 'no-store' }
        : { next: { revalidate: revalidate } },
    });

    const data = response.data as WishlistResponse;

    if (!data?.customer) {
      return undefined;
    }

    const transformedData = {
      pageInfo: data.customer.wishlists.pageInfo,
      wishlists: removeEdgesAndNodes(data.customer.wishlists).map((wishlist: WishlistEdgeNode) => ({
        ...wishlist,
        items: removeEdgesAndNodes(wishlist.items).map((item: WishlistItem) => ({
          ...item,
          product: {
            ...item.product,
            variants: item.product.variants
              ? removeEdgesAndNodes(item.product.variants).map((variant) => ({
                  ...variant,
                  options: variant.options ? removeEdgesAndNodes(variant.options) : [],
                }))
              : [],
          },
        })),
      })),
    };

    return transformedData;
  },
);

export type { WishlistItem, Product, ProductVariant, VariantOption, OptionValue, PriceData };
