import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, ResultOf, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { OrderItemFragment } from './_components/product-snippet';

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

const CustomerAllOrders = graphql(
  `
    query CustomerAllOrders(
      $after: String
      $before: String
      $first: Int
      $last: Int
      $filters: OrdersFiltersInput
    ) {
      customer {
        orders(after: $after, before: $before, first: $first, last: $last, filters: $filters) {
          pageInfo {
            ...PaginationFragment
          }
          edges {
            node {
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
              consignments {
                shipping {
                  edges {
                    node {
                      lineItems {
                        edges {
                          node {
                            ...OrderItemFragment
                          }
                        }
                      }
                      shipments {
                        edges {
                          node {
                            ...OrderShipmentFragment
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
    }
  `,
  [OrderItemFragment, OrderShipmentFragment, PaginationFragment],
);

const CustomerOrderDetails = graphql(
  `
    query CustomerOrderDetails(
      $filter: OrderFilterInput
      $after: String
      $before: String
      $first: Int
      $last: Int
    ) {
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
            stateOrProvince
            postalCode
            country
          }
          consignments {
            shipping(before: $before, after: $after, first: $first, last: $last) {
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

const ProductAttributes = graphql(`
  query ProductAttributes($entityId: Int) {
    site {
      product(entityId: $entityId) {
        path
      }
    }
  }
`);

type Variables = VariablesOf<typeof ProductAttributes>;

export const getProductAttributes = cache(async (variables: Variables) => {
  const response = await client.fetch({
    document: ProductAttributes,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.product;
});

type ShippingConsignments = NonNullable<
  NonNullable<ResultOf<typeof CustomerOrderDetails>['site']['order']>['consignments']
>['shipping'];

const addProductAttributesToShippingConsignments = async (consignments: ShippingConsignments) => {
  const shipping = removeEdgesAndNodes(consignments);

  const shippingConsignments = await Promise.all(
    shipping.map(async (consignment) => {
      const { lineItems, shipments, ...otherItems } = consignment;
      const extendedLineItems = await Promise.all(
        removeEdgesAndNodes(lineItems).map(async ({ productEntityId, ...otherAttributes }) => {
          const productAtrributes = await getProductAttributes({
            entityId: productEntityId,
          });

          const { path = '' } = productAtrributes ?? {};

          return {
            productEntityId,
            path,
            ...otherAttributes,
          };
        }),
      );

      return {
        lineItems: extendedLineItems,
        shipments: removeEdgesAndNodes(shipments),
        ...otherItems,
      };
    }),
  );

  return shippingConsignments;
};

type OrdersFiltersInput = VariablesOf<typeof CustomerAllOrders>['filters'];
type OrderStatus = NonNullable<OrdersFiltersInput>['status'];
type OrderDateRange = NonNullable<OrdersFiltersInput>['dateRange'];

interface CustomerOrdersArgs {
  after?: string;
  before?: string;
  limit?: number;
  filterByStatus?: OrderStatus;
  filterByDateRange?: OrderDateRange;
}

export const getCustomerOrders = cache(
  async ({
    before = '',
    after = '',
    filterByStatus,
    filterByDateRange,
    limit = 2,
  }: CustomerOrdersArgs) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };
    const filtersArgs = {
      filters: {
        ...(filterByDateRange && { dateRange: filterByDateRange }),
        ...(filterByStatus && { status: filterByStatus }),
      },
    };
    const response = await client.fetch({
      document: CustomerAllOrders,
      variables: { ...paginationArgs, ...filtersArgs },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const orders = response.data.customer?.orders;

    if (!orders) {
      return undefined;
    }

    const data = {
      orders: await Promise.all(
        removeEdgesAndNodes(orders).map(async (order) => {
          const shipping =
            order.consignments?.shipping &&
            (await addProductAttributesToShippingConsignments(order.consignments.shipping));

          return {
            ...order,
            consignments: {
              shipping,
            },
          };
        }),
      ),
      pageInfo: orders.pageInfo,
    };

    return data;
  },
);

interface OrderDetailsProps extends CustomerOrdersArgs {
  orderId: string;
}

export const getOrderDetails = cache(
  async ({ orderId, before = '', after = '', limit = 2 }: OrderDetailsProps) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: CustomerOrderDetails,
      variables: {
        ...paginationArgs,
        filter: {
          entityId: +orderId,
        },
      },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });
    const order = response.data.site.order;

    if (!order) {
      return undefined;
    }

    const shipping =
      order.consignments?.shipping &&
      (await addProductAttributesToShippingConsignments(order.consignments.shipping));

    const data = {
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
      },
      paymentInfo: {
        billingAddress: order.billingAddress,
        // TODO: add payments data
      },
      consignments: {
        shipping,
      },
    };

    return data;
  },
);

export type OrderDetailsDataType = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
