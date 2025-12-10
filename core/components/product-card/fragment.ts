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
      inventory {
        hasVariantInventory
        isInStock
        aggregated {
          availableForBackorder
          unlimitedBackorder
          availableOnHand
        }
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      variants(first: 1) {
        edges {
          node {
            entityId
            sku
            inventory {
              byLocation {
                edges {
                  node {
                    locationEntityId
                    backorderMessage
                  }
                }
              }
            }
          }
        }
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
