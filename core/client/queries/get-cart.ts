import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';
import { doNotCachePolicyWithEntityTags, TAGS } from "../cache-policy";

const MoneyFieldFragment = graphql(`
  fragment MoneyFieldFragment on Money {
    currencyCode
    value
  }
`);

const GetCartQuery = graphql(
  `
    query GetCartQuery($cartId: String) {
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
                ...MoneyFieldFragment
              }
              extendedSalePrice {
                ...MoneyFieldFragment
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
                ...MoneyFieldFragment
              }
              extendedSalePrice {
                ...MoneyFieldFragment
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
            ...MoneyFieldFragment
          }
          discountedAmount {
            ...MoneyFieldFragment
          }
        }
      }
    }
  `,
  [MoneyFieldFragment],
);

export const getCart = cache(async (cartId?: string, channelId?: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCartQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: doNotCachePolicyWithEntityTags({ entityType: TAGS.cart }),
    channelId,
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
