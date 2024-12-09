import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, VariablesOf } from '~/client/graphql';

import { OrderShipmentFragment } from '../order/[slug]/page-data';

import { OrderItemFragment } from './_components/product-snippet';

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
      orders: removeEdgesAndNodes(orders).map((order) => {
        return {
          ...order,
          consignments: {
            shipping:
              order.consignments?.shipping && removeEdgesAndNodes(order.consignments.shipping),
          },
        };
      }),
      pageInfo: orders.pageInfo,
    };

    return data;
  },
);
