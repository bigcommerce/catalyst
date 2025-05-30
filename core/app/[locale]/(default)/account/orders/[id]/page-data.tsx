import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { OrderItemFragment } from '../fragment';

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
            shipping {
              edges {
                node {
                  entityId
                  shippingAddress {
                    firstName
                    lastName
                    address1
                    address2
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
  [OrderItemFragment],
);

export const getCustomerOrderDetails = cache(async (id: number) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: CustomerOrderDetails,
    variables: {
      filter: {
        entityId: id,
      },
    },
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    customerAccessToken,
    errorPolicy: 'auth',
  });

  const order = response.data.site.order;

  if (!order) {
    return undefined;
  }

  return {
    ...order,
    consignments: {
      shipping:
        order.consignments?.shipping &&
        removeEdgesAndNodes(order.consignments.shipping).map((consignment) => {
          return {
            ...consignment,
            lineItems: removeEdgesAndNodes(consignment.lineItems),
            shipments: removeEdgesAndNodes(consignment.shipments),
          };
        }),
    },
  };
});
