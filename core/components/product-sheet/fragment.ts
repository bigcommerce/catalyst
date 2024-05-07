import { graphql } from '~/client/graphql';

import { ProductFormFragment } from '../product-form/fragment';

export const ProductSheetContentFragment = graphql(
  `
    fragment ProductSheetContentFragment on Product {
      ...ProductFormFragment
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
  [ProductFormFragment],
);
