import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const OrderItemFragment = graphql(`
  fragment OrderItemFragment on OrderPhysicalLineItem {
    entityId
    brand
    name
    quantity
    subTotalListPrice {
      value
      currencyCode
    }
    productOptions {
      __typename
      name
      value
    }
  }
`);

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

const CustomerOrderDetails = graphql(
  `
    query CustomerOrderDetails(
      $filter: OrderFilterInput
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

interface OrderDetailsProps {
  orderId: string;
}

export const getOrderDetails = async ({ orderId}: OrderDetailsProps) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CustomerOrderDetails,
    variables: {
      filter: {
        entityId: +orderId,
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });
  const order = response.data.site.order;
  console.log('========order==data=====', JSON.stringify(response));
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
