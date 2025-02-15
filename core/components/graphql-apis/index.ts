'use server';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { getSessionCustomerAccessToken } from '~/auth';
import { revalidate } from '~/client/revalidate-target';
import { OrderItemFragment } from '~/app/[locale]/(default)/account/(tabs)/orders/_components/product-snippet';
import { cache } from 'react';
import { OrderDetailsType } from '~/app/[locale]/(default)/account/(tabs)/order/[slug]/page-data';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  ProductItemFragment,
  ProductPageQuery,
} from '~/app/[locale]/(default)/product/[slug]/page-data';
import { ProductPageSKUQuery } from '~/app/[locale]/(default)/product/[slug]/page-data';
import { cookies } from 'next/headers';

const ProductMetaFieldsQuery = graphql(`
  query ProductMetaFieldsQuery($entityId: Int!, $nameSpace: String!) {
    site {
      product(entityId: $entityId) {
        metafields(namespace: $nameSpace, first: 50) {
          edges {
            cursor
            node {
              entityId
              id
              key
              value
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            startCursor
            hasPreviousPage
          }
        }
      }
    }
  }
`);

export const getProductMetaFields = async (entityId: number, nameSpace: string) => {
  const { data } = await client.fetch({
    document: ProductMetaFieldsQuery,
    variables: { entityId: entityId, nameSpace: nameSpace },
  });
  return data;
};

const splitArray = (array: Array<any>, count: number) => {
  let result = [],
    i = 0;
  while (i < array.length) {
    result.push(array?.slice(i, (i += count)));
  }
  return result;
};

export const GetVariantsByProductSKU = async (skuArray: any) => {
  let productVariantData: Array<any> = [];
  if (skuArray?.length > 0) {
    let splitSkuArray = splitArray(skuArray, 20);
    if (splitSkuArray?.length > 0) {
      for await (const skuArrayData of splitSkuArray) {
        let skuQuery = '';
        skuQuery += `query ProductsQuery {
          site {`;
        let index: number = 1;
        for await (const sku of skuArrayData) {
          skuQuery += `SKU${index}: product(sku: "${sku}") {
            sku
            entityId
            name
            mpn
            images {
              edges {
                node {
                  altText
                  url(width: 350)
                  isDefault
                }
              }
            }
            prices {
              retailPrice {
                value
                formatted
              }
              salePrice {
                formatted
                value
              }
              price {
                formatted
                value
              }
            }
            upc
            availabilityV2 {
             status
             description
            }
            categories {
              edges {
                node {
                  id
                  entityId
                  name
                  path
                }
              }
            }
          }`;
          index++;
        }
        skuQuery += `}
        }`;
        const customerAccessToken = await getSessionCustomerAccessToken();
        const { data } = await client.fetch({
          document: graphql(skuQuery),
          customerAccessToken,
          fetchOptions: { next: { revalidate } },
        });
        Object.values(data?.site)?.forEach((element: any) => {
          if (element?.sku) {
            productVariantData.push({ ...element });
          }
        });
      }
    }
  }
  return productVariantData;
};

const OrderShipmentFragment = graphql(`
  fragment OrderShipmentFragment on OrderShipment {
    shippingMethodName
    shippingProviderName
    tracking {
      __typename
      ... on OrderShipmentNumberAndUrlTracking {
        number
        url
      }
      ... on OrderShipmentUrlOnlyTracking {
        url
      }
      ... on OrderShipmentNumberOnlyTracking {
        number
      }
    }
  }
`);

const mapOrderData = (order: OrderDetailsType) => {
  const shipping = order.consignments?.shipping
    ? removeEdgesAndNodes(order.consignments.shipping).map(
        ({ shipments, lineItems, ...otherItems }) => ({
          ...otherItems,
          lineItems: removeEdgesAndNodes(lineItems),
          shipments: removeEdgesAndNodes(shipments),
        }),
      )
    : undefined;

  return {
    orderState: {
      orderId: order.entityId,
      status: order.status,
      orderDate: order.orderedAt,
    },
    summaryInfo: {
      subtotal: order.subTotal,
      discounts: order.discounts,
      shipping: order.shippingCostTotal,
      tax: order.taxTotal,
      grandTotal: order.totalIncTax,
      handlingCost: order.handlingCostTotal,
    },
    paymentInfo: {
      billingAddress: order.billingAddress,
      // TODO: add payments data
    },
    consignments: {
      shipping,
    },
  };
};

const CustomerOrderDetails = graphql(
  `
    query CustomerOrderDetails($filter: OrderFilterInput) {
      site {
        order(filter: $filter) {
          entityId
          orderedAt {
            utc
          }
          status {
            label
            value
          }
          totalIncTax {
            value
            currencyCode
          }
          subTotal {
            value
            currencyCode
          }
          discounts {
            nonCouponDiscountTotal {
              value
              currencyCode
            }
            couponDiscounts {
              couponCode
              discountedAmount {
                value
                currencyCode
              }
            }
          }
          handlingCostTotal {
            currencyCode
            value
          }
          shippingCostTotal {
            value
            currencyCode
          }
          taxTotal {
            value
            currencyCode
          }
          billingAddress {
            firstName
            lastName
            address1
            city
            email
            stateOrProvince
            postalCode
            country
            countryCode
          }
          consignments {
            shipping {
              edges {
                node {
                  entityId
                  shippingAddress {
                    firstName
                    lastName
                    address1
                    city
                    stateOrProvince
                    postalCode
                    country
                    countryCode
                  }
                  shipments {
                    edges {
                      node {
                        entityId
                        shippedAt {
                          utc
                        }
                        ...OrderShipmentFragment
                      }
                    }
                  }
                  lineItems {
                    edges {
                      node {
                        ...OrderItemFragment
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
  [OrderItemFragment, OrderShipmentFragment],
);

export const getOrderDetails = cache(
  async (variables: VariablesOf<typeof CustomerOrderDetails>) => {
    const customerAccessToken = await getSessionCustomerAccessToken();

    const response = await client.fetch({
      document: CustomerOrderDetails,
      variables,
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });
    const order = response.data.site.order;

    if (!order) {
      return undefined;
    }
    const data = mapOrderData(order);
    return data;
  },
);

export const getGuestOrderDetails = cache(
  async (variables: VariablesOf<typeof CustomerOrderDetails>) => {
    const response = await client.fetch({
      document: CustomerOrderDetails,
      variables,
      fetchOptions: { cache: 'no-store' },
    });
    const order = response.data.site.order;

    if (!order) {
      return undefined;
    }
    const data = mapOrderData(order);
    return data;
  },
);

type Variables = VariablesOf<typeof ProductPageQuery>;

export const getProduct = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  if (data.site && data.site.product && data.site.parent)
    data.site.product = {
      ...data.site.product,
      parent: data.site.parent,
    } as any;

  return data.site.product as any;
});

type SkuVariables = VariablesOf<typeof ProductPageSKUQuery>;

export const getProductBySku = async (variables: SkuVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const { data } = await client.fetch({
    document: ProductPageSKUQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  if (data.site && data.site.product && data.site.parent)
    data.site.product = {
      ...data.site.product,
      parent: data.site.parent,
    } as any;

  return data.site.product as any;
};

export const getCookieData = async() => {
  return await cookies();
}

const GetMultipleChoiceOptionsQuery = graphql(`
  query GetMultipleChoiceOptions($entityId: Int!, $valuesCursor: String) {
    site {
      product(entityId: $entityId) {
        entityId
        productOptions(first: 50) {
          edges {
            node {
              entityId
              displayName
              isRequired
              ... on MultipleChoiceOption {
                displayStyle
                values(first: 50, after: $valuesCursor) {
                  edges {
                    node {
                      entityId
                      label
                      isDefault
                      isSelected
                      ... on SwatchOptionValue {
                        __typename
                        hexColors
                        imageUrl(lossy: true, width: 40)
                      }
                      ... on ProductPickListOptionValue {
                        __typename
                        defaultImage {
                          altText
                          url: urlTemplate(lossy: true)
                        }
                      }
                    }
                  }
                  pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                    hasPreviousPage
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

export const getMultipleChoiceOptions = async (
  productId: number | undefined,
  valuesCursor?: string | null,
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: GetMultipleChoiceOptionsQuery,
    variables: { entityId: productId, valuesCursor },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  // const multipleChoiceOptions = data?.site?.product || [];
  const pId = data?.site?.product?.entityId;

  const multipleChoiceOptions =
    data?.site?.product?.productOptions?.edges
      ?.map((edge) => edge.node)
      ?.filter((node) => node?.displayStyle === 'Swatch') || [];
  const swatchValuesEdges =
    multipleChoiceOptions?.map((option) => option.values?.edges).flat() || [];
  const pageInfo = multipleChoiceOptions?.map((option) => option.values?.pageInfo).flat() || [];
  const pageInfo1 = pageInfo?.[0];
  return {
    multipleChoiceOptions,
    swatchValuesEdges,
    pId,
    pageInfo,
    endCursor: pageInfo1?.endCursor || null,
    hasNextPage: pageInfo1?.hasNextPage ?? null,
  };
};

import { PaginationFragment } from '~/client/fragments/pagination';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';

// Interfaces
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

// Fragments
const ReviewSummaryFragment = graphql(`
  fragment ReviewSummaryFragment on Product {
    reviewSummary {
      numberOfReviews
      averageRating
    }
  }
`);

// Main Query
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
                              retailPrice {
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
                        retailPrice {
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

// Types
type WishlistsVariables = VariablesOf<typeof WishlistsQuery>;
type WishlistsFiltersInput = WishlistsVariables['filters'];

// Helper Functions
function transformWishlistData(data: WishlistResponse) {
  return {
    pageInfo: data.customer?.wishlists.pageInfo,
    wishlists: removeEdgesAndNodes(data.customer?.wishlists).map((wishlist: WishlistEdgeNode) => ({
      ...wishlist,
      items: removeEdgesAndNodes(wishlist.items).map((item: WishlistItem) => ({
        ...item,
        product: {
          ...item.product,
          variants: item.product.variants
            ? removeEdgesAndNodes(item.product.variants).map((variant: ProductVariant) => ({
                ...variant,
                options: variant.options ? removeEdgesAndNodes(variant.options) : [],
              }))
            : [],
        },
      })),
    })),
  };
}

// Main Export Function
export const getWishlists = cache(
  async ({ limit = 3, before, after, filters }: GetWishlistsParams) => {
    try {
      const customerAccessToken = await getSessionCustomerAccessToken();
      const paginationArgs = before ? { last: limit, before } : { first: limit, after };

      const response = await client.fetch({
        document: WishlistsQuery,
        variables: { filters, ...paginationArgs },
        customerAccessToken,
        fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
      });

      const data = response.data as WishlistResponse;

      if (!data?.customer) {
        return undefined;
      }

      return transformWishlistData(data);
    } catch (error) {
      console.error('Error in getWishlists:', error);
      return undefined;
    }
  },
);

// Type Exports
export type {
  WishlistItem,
  WishlistResponse,
  GetWishlistsParams,
  Product,
  ProductVariant,
  VariantOption,
  OptionValue,
  PriceData,
};
