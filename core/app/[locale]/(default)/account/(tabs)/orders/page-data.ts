import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';

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
    query CustomerAllOrders($after: String, $before: String, $first: Int, $last: Int) {
      customer {
        orders(after: $after, before: $before, first: $first, last: $last) {
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

interface CustomerOrdersArgs {
  after?: string;
  before?: string;
  limit?: number;
}

export const getCustomerOrders = cache(
  async ({ before = '', after = '', limit = 2 }: CustomerOrdersArgs) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: CustomerAllOrders,
      variables: { ...paginationArgs },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const orders = response.data.customer?.orders;
    console.log('========orders page.ts=======', orders);
    if (!orders) {
      return undefined;
    }

    const data = {
      orders: removeEdgesAndNodes(orders).map((order) => ({
        ...order,
        consignments: {
          ...(order.consignments?.shipping && {
            shipping: removeEdgesAndNodes(order.consignments.shipping),
          }),
        },
      })),
      pageInfo: orders.pageInfo,
    };

    // TODO: add product, brand paths later

    return data;
  },
);

interface OrderDetailsProps extends CustomerOrdersArgs {
  orderId: string;
}

export const getOrderDetails = 
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
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    console.log('========response=======', JSON.stringify(response));
    const order = response.data.site.order;

    if (!order) {
      return undefined;
    }

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
        ...(order.consignments?.shipping && {
          shipping: removeEdgesAndNodes(order.consignments.shipping),
        }),
      },
    };

    return data;
  };

export type OrderDetailsDataType = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
