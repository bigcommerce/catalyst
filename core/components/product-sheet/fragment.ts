import { PricingFragment } from '~/client/fragments/pricing';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { graphql } from '~/client/graphql';

import { ProductFormFragment } from '../product-form/fragment';

export const ProductSheetContentFragment = graphql(
  `
    fragment ProductSheetContentFragment on Product {
      name
      defaultImage {
        url: urlTemplate
        altText
      }
      brand {
        name
      }
      reviewSummary {
        averageRating
        numberOfReviews
      }
      ...PricingFragment
      ...ProductFormFragment
      ...ProductItemFragment
    }
  `,
  [PricingFragment, ProductFormFragment, ProductItemFragment],
);
