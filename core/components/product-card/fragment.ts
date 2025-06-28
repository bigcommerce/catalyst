import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';

export const ProductCardFragment = graphql(
  `
    fragment ProductCardFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate(lossy: true)
      }
      path
      brand {
        name
        path
      }
      description
      categories {
        edges {
          node {
            name
          }
        }
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
