import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';

export const MakeswiftProductFragment = graphql(
  `
    fragment MakeswiftProductFragment on Product {
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
      reviewSummary {
        numberOfReviews
        averageRating
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
