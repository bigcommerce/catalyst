import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const MONEY_FIELDS_FRAGMENT = graphql(`
  fragment MoneyFields on Money {
    currencyCode
    value
  }
`);

const GET_CHECKOUT_QUERY = graphql(
  `
    query getCheckout($checkoutId: String) {
      site {
        checkout(entityId: $checkoutId) {
          entityId
          subtotal {
            ...MoneyFields
          }
          grandTotal {
            ...MoneyFields
          }
          handlingCostTotal {
            ...MoneyFields
          }
          shippingCostTotal {
            ...MoneyFields
          }
          taxTotal {
            ...MoneyFields
          }
          shippingConsignments {
            entityId
            lineItemIds
            address {
              countryCode
              city
              stateOrProvince
              postalCode
            }
            selectedShippingOption {
              description
              entityId
            }
            availableShippingOptions {
              entityId
              description
              cost {
                value
                currencyCode
              }
              isRecommended
              type
            }
          }
          coupons {
            code
            entityId
            discountedAmount {
              ...MoneyFields
            }
          }
          cart {
            currencyCode
            discountedAmount {
              ...MoneyFields
            }
            lineItems {
              physicalItems {
                entityId
                quantity
              }
            }
          }
        }
      }
    }
  `,
  [MONEY_FIELDS_FRAGMENT],
);

export const getCheckout = cache(async (checkoutId?: string) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_CHECKOUT_QUERY,
    variables: { checkoutId },
    customerId,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: ['checkout'],
      },
    },
  });

  const checkout = response.data.site.checkout;

  if (!checkout) {
    return;
  }

  return checkout;
});
