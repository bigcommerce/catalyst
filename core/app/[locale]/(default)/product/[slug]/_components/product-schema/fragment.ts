import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';

export const ProductSchemaFragment = graphql(
  `
    fragment ProductSchemaFragment on Product {
      name
      path
      plainTextDescription(characterLimit: 1200)
      sku
      gtin
      mpn
      brand {
        name
        path
      }
      reviewSummary {
        averageRating
        numberOfReviews
      }
      defaultImage {
        url: urlTemplate(lossy: true)
      }
      condition
      availabilityV2 {
        status
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
