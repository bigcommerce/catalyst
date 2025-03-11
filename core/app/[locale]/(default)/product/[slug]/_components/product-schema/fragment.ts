import { graphql } from '~/client/graphql';

export const ProductSchemaFragment = graphql(`
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
    prices(currencyCode: $currencyCode) {
      price {
        value
        currencyCode
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
    condition
    availabilityV2 {
      status
    }
  }
`);
