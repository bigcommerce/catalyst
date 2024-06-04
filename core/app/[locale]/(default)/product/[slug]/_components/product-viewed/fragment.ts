import { graphql } from 'gql.tada';

import { ProductFormFragment } from '~/components/product-form/fragment';
import { ProductSchemaFragment } from '../product-schema';
import { ReviewSummaryFragment } from '../review-summary';

export const ProductViewedFragment = graphql(
  `
    fragment ProductViewedFragment on Product {
      ...ReviewSummaryFragment
      ...ProductSchemaFragment
      ...ProductFormFragment
      entityId
      name
      sku
      upc
      minPurchaseQuantity
      maxPurchaseQuantity
      condition
      weight {
        value
        unit
      }
      availabilityV2 {
        description
      }
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      brand {
        name
      }
      prices {
        priceRange {
          min {
            value
          }
          max {
            value
          }
        }
        retailPrice {
          value
        }
        salePrice {
          value
        }
        basePrice {
          value
        }
        price {
          value
          currencyCode
        }
      }
    }
  `,
  [ReviewSummaryFragment, ProductSchemaFragment, ProductFormFragment],
);
