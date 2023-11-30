export const PRODUCT_DETAILS_FRAGMENT = /* GraphQL */ `
  fragment ProductDetails on Product {
    entityId
    name
    path
    prices {
      basePrice {
        value
        currencyCode
      }
      price {
        value
        currencyCode
      }
      retailPrice {
        value
        currencyCode
      }
      salePrice {
        value
        currencyCode
      }
      priceRange {
        min {
          value
          currencyCode
        }
        max {
          value
          currencyCode
        }
      }
    }
    brand {
      name
    }
    defaultImage {
      url(width: $imageWidth, height: $imageHeight)
      altText
    }
  }
`;
