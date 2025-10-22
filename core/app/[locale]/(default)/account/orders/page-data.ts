import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { OrderGiftCertificateItemFragment, OrderItemFragment } from './fragment';

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
                    }
                  }
                }
                email {
                  giftCertificates {
                    edges {
                      node {
                        lineItems {
                          edges {
                            node {
                              ...OrderGiftCertificateItemFragment
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
    }
  `,
  [OrderItemFragment, OrderGiftCertificateItemFragment, PaginationFragment],
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
    limit = 5,
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
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
      errorPolicy: 'auth',
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
              order.consignments?.shipping &&
              removeEdgesAndNodes(order.consignments.shipping).map((consignment) => {
                return {
                  ...consignment,
                  lineItems: removeEdgesAndNodes(consignment.lineItems),
                };
              }),
            email:
              order.consignments?.email &&
              removeEdgesAndNodes(order.consignments.email.giftCertificates).map(
                ({ lineItems }) => {
                  return {
                    lineItems: removeEdgesAndNodes(lineItems).map(
                      ({ entityId, name, salePrice }) => ({
                        entityId,
                        name,
                        salePrice,
                      }),
                    ),
                  };
                },
              ),
          },
        };
      }),
      pageInfo: orders.pageInfo,
    };

    return data;
  },
);
