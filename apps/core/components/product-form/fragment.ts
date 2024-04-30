import { graphql } from '~/client/graphql';

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
      availabilityV2 {
        status
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
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
  ],
);
