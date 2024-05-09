import { graphql } from '../graphql';

export const PRICES_FRAGMENT = graphql(`
  fragment Prices on Product {
    prices {
      basePrice {
        currencyCode
        value
      }
      price {
        currencyCode
        value
      }
      retailPrice {
        currencyCode
        value
      }
      salePrice {
        currencyCode
        value
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
  }
`);
