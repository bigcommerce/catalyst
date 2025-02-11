import { graphql } from '~/client/graphql';
import { AddToCartButtonFragment } from '~/components/add-to-cart-button/fragment';

import { CheckboxFieldFragment } from './fields/checkbox-field/fragment';
import { DateFieldFragment } from './fields/date-field/fragment';
import { MultiLineTextFieldFragment } from './fields/multi-line-text-field/fragment';
import { MultipleChoiceFieldFragment } from './fields/multiple-choice-field/fragment';
import { NumberFieldFragment } from './fields/number-field/fragment';
import { TextFieldFragment } from './fields/text-field/fragment';

export const ProductFormFragment = graphql(
  `
    fragment ProductFormFragment on Product {
      entityId
      name
      mpn
      sku
      upc
      customFields{
      edges
      }
      weight {
      unit
      value
      }
      UpdatePriceForMSRP {
      originalPrice
      discount
      hasDiscount
      updatedPrice
      }
      prices{
       basePrice {
       currencyCode
       value
       }
      }
      inventory{
      isInStock
      prices
      }
      brand {
      entityId
      name
      }
      variants {
        edges {
          node {
            entityId
            sku
          }
        }
      }
      productOptions(first: 10) {
        edges {
          node {
            __typename
            entityId
            displayName
            isRequired
            isVariantOption
            ...MultipleChoiceFieldFragment
            ...CheckboxFieldFragment
            ...NumberFieldFragment
            ...TextFieldFragment
            ...MultiLineTextFieldFragment
            ...DateFieldFragment
          }
        }
      }
      ...AddToCartButtonFragment
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
    AddToCartButtonFragment,
  ],
);
