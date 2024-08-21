import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';

const CustomerAllOrders = graphql(
  `
    query CustomerAllOrders($after: String, $before: String, $first: Int, $last: Int) {
      site {
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
                shipping(before: $before, after: $after, first: $first, last: $last) {
                  edges {
                    node {
                      lineItems {
                        edges {
                          node {
                            entityId
                            brand
                            name
                            image {
                              altText
                              url: urlTemplate
                            }
                            subTotalListPrice {
                              value
                              currencyCode
                            }
                            quantity
                          }
                        }
                      }
                      shipments(before: $before, after: $after, first: $first, last: $last) {
                        edges {
                          node {
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
  [PaginationFragment],
);

interface CustomerOrdersArgs {
  after?: string;
  before?: string;
  limit?: number;
}

export const getCustomerOrders = cache(
  async ({ before = '', after = '', limit = 2 }: CustomerOrdersArgs) => {
    const customerId = await getSessionCustomerId();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: CustomerAllOrders,
      variables: { ...paginationArgs },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const orders = response.data.site.orders;

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

    // TODO: check approach to get product path later

    return data;
  },
);
