import { graphql } from '../graphql';

export const PricingFragment = graphql(`
  fragment PricingFragment on Product {
    pricesIncludingTax: prices(currencyCode: $currencyCode, includeTax: true) {
      price {
        value
        currencyCode
      }
      basePrice {
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
    pricesExcludingTax: prices(currencyCode: $currencyCode, includeTax: false) {
      price {
        value
        currencyCode
      }
      basePrice {
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
  }
`);
