import { graphql } from '~/client/graphql';

import { ProductItemFragment } from '../../client/fragments/product-item';
import { ProductFormFragment } from '../product-form/fragment';

export const ProductSheetContentFragment = graphql(
  `
    fragment ProductSheetContentFragment on Product {
      ...ProductFormFragment
      ...ProductItemFragment
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
      prices {
        price {
          currencyCode
          value
        }
        retailPrice {
          value
        }
        salePrice {
          value
        }
        basePrice {
          value
        }
        priceRange {
          min {
            value
          }
          max {
            value
          }
        }
      }
    }
  `,
  [ProductFormFragment, ProductItemFragment],
);
