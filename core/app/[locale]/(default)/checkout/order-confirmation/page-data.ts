import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';

import { OrderItemFragment } from '../../account/(tabs)/orders/_components/product-snippet';

export const OrderShipmentFragment = graphql(`
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

    return order;
  },
);

export type OrderDetailsType = ExistingResultType<typeof getOrderDetails>;
