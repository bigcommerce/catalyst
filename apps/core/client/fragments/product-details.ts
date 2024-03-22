import { graphql } from '../graphql';

import { PRICES_FRAGMENT } from './prices';

export const PRODUCT_DETAILS_FRAGMENT = graphql(
  `
    fragment ProductDetails on Product {
      entityId
      name
      description
      path
      ...Prices
      brand {
        name
        path
      }
      defaultImage {
        url: urlTemplate
        altText
      }
      availabilityV2 {
        status
      }
      inventory {
        aggregated {
          availableToSell
        }
      }
      reviewSummary {
        averageRating
        numberOfReviews
      }
      categories {
        edges {
          node {
            name
            path
          }
        }
      }
      productOptions(first: 3) {
        edges {
          node {
            entityId
          }
        }
      }
    }
  `,
  [PRICES_FRAGMENT],
);
