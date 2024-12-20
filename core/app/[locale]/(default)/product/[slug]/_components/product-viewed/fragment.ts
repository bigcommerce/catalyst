import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';

export const ProductViewedFragment = graphql(
  `
    fragment ProductViewedFragment on Product {
      entityId
      name
      brand {
        name
      }
      sku
      description
      plainTextDescription(characterLimit: 1200)
      path
      variants {
        edges {
          node {
            entityId
          }
        }
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
