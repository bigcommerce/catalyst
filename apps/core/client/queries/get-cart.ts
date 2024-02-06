import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';

export const GET_CART_QUERY = /* GraphQL */ `
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
            discountedAmount {
              ...MoneyFields
            }
            selectedOptions {
              __typename
              entityId
              name
              ... on CartSelectedMultipleChoiceOption {
                value
              }
              ... on CartSelectedCheckboxOption {
                value
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
      }
    }
  }
`;

export const getCart = cache(async (cartId?: string) => {
  const query = graphql(GET_CART_QUERY);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: query,
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

  const totalDiscountedAmount = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.discountedAmount.value;
  }, 0);

  const totalExtendedSalePrice = cart.lineItems.physicalItems.reduce((acc, item) => {
    return acc + item.extendedSalePrice.value;
  }, 0);

  return {
    ...cart,
    totalExtendedListPrice: {
      currencyCode: cart.currencyCode,
      value: totalExtendedListPrice,
    },
    totalDiscountedAmount: {
      currencyCode: cart.currencyCode,
      value: totalDiscountedAmount,
    },
    totalExtendedSalePrice: {
      currencyCode: cart.currencyCode,
      value: totalExtendedSalePrice,
    },
  };
});
