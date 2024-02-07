export const PRODUCT_DETAILS_FRAGMENT = /* GraphQL */ `
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
      url(width: $imageWidth, height: $imageHeight)
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
`;
