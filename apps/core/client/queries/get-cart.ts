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

const GET_CART_QUERY = graphql(
  `
    query getCart($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          isTaxIncluded
          currencyCode
          lineItems {
            totalQuantity
            physicalItems {
              name
              brand
              imageUrl
              entityId
              quantity
              productEntityId
              variantEntityId
              extendedListPrice {
                ...MoneyFields
              }
              extendedSalePrice {
                ...MoneyFields
              }
              selectedOptions {
                __typename
                entityId
                name
                ... on CartSelectedMultipleChoiceOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedCheckboxOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedNumberFieldOption {
                  number
                }
                ... on CartSelectedMultiLineTextFieldOption {
                  text
                }
                ... on CartSelectedTextFieldOption {
                  text
                }
                ... on CartSelectedDateFieldOption {
                  date {
                    utc
                  }
                }
              }
            }
            digitalItems {
              name
              brand
              imageUrl
              entityId
              quantity
              productEntityId
              variantEntityId
              extendedListPrice {
                ...MoneyFields
              }
              extendedSalePrice {
                ...MoneyFields
              }
              selectedOptions {
                __typename
                entityId
                name
                ... on CartSelectedMultipleChoiceOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedCheckboxOption {
                  value
                  valueEntityId
                }
                ... on CartSelectedNumberFieldOption {
                  number
                }
                ... on CartSelectedMultiLineTextFieldOption {
                  text
                }
                ... on CartSelectedTextFieldOption {
                  text
                }
                ... on CartSelectedDateFieldOption {
                  date {
                    utc
                  }
                }
              }
            }
          }
          amount {
            ...MoneyFields
          }
          discountedAmount {
            ...MoneyFields
          }
        }
      }
    }
  `,
  [MONEY_FIELDS_FRAGMENT],
);

export const getCart = cache(async (cartId?: string) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_CART_QUERY,
    variables: { cartId },
    customerId,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: ['cart'],
      },
    },
  });

  const cart = response.data.site.cart;

  if (!cart) {
    return;
  }

  const totalExtendedListPrice = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.extendedListPrice.value;
  }, 0);

  return {
    ...cart,
    totalExtendedListPrice: {
      currencyCode: cart.currencyCode,
      value: totalExtendedListPrice,
    },
  };
});
