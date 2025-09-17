import { graphql } from '../graphql';

export const PricesFragment = graphql(`
  fragment PricesFragment on Prices {
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
`);

export const PricingFragment = graphql(
  `
    fragment PricingFragment on Product {
      pricesExcTax: prices(currencyCode: $currencyCode, includeTax: false) {
        ...PricesFragment
      }
      pricesIncTax: prices(currencyCode: $currencyCode, includeTax: false) {
        ...PricesFragment
      }
    }
  `,
  [PricesFragment],
);

export const TaxSettingsFragment = graphql(`
  fragment TaxSettingsFragment on Settings {
    tax {
      pdp
      plp
    }
  }
`);
