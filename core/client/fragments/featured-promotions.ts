import { graphql } from '../graphql';

export const FeaturedPromotionsFragment = graphql(`
  fragment FeaturedPromotionsFragment on Product {
    featuredPromotions {
      entityId
      text
    }
  }
`);
