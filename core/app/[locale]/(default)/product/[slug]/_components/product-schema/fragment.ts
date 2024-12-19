import { graphql } from '~/client/graphql';

export const ProductSchemaFragment = graphql(`
  fragment ProductSchemaFragment on Product {
    name
    path
    plainTextDescription
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
    prices {
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
