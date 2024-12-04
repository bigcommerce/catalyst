import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';

import {
  OrderItemFragment,
  ProductAttributes,
  ProductAttributesVariables,
} from '../../orders/_components/product-snippet';

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

export const getProductAttributes = cache(async (variables: ProductAttributesVariables) => {
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

export const addProductAttributesToShippingConsignments = async (
  consignments: ShippingConsignments,
) => {
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

type OrderVariables = VariablesOf<typeof CustomerOrderDetails>;

export const getOrderDetails = cache(async (variables: OrderVariables) => {
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
});

export type OrderDetailsType = ExistingResultType<typeof getOrderDetails>;
