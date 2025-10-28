import { graphql } from '~/client/graphql';

export const OrderItemFragment = graphql(`
  fragment OrderItemFragment on OrderPhysicalLineItem {
    entityId
    productEntityId
    brand
    name
    quantity
    baseCatalogProduct {
      path
    }
    image {
      url: urlTemplate(lossy: true)
      altText
    }
    subTotalListPrice {
      value
      currencyCode
    }
    catalogProductWithOptionSelections {
      prices {
        price {
          value
          currencyCode
        }
      }
    }
    productOptions {
      __typename
      name
      value
    }
  }
`);
