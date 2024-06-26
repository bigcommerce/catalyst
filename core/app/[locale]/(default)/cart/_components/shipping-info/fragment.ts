import { graphql } from '~/client/graphql';

import { ShippingOptionsFragment } from '../shipping-options/fragment';

export const ShippingInfoFragment = graphql(
  `
    fragment ShippingInfoFragment on Checkout {
      entityId
      shippingConsignments {
        entityId
        ...ShippingOptionsFragment
        selectedShippingOption {
          entityId
          description
        }
        address {
          city
          countryCode
          stateOrProvince
          postalCode
        }
      }
      cart {
        lineItems {
          physicalItems {
            entityId
            quantity
          }
        }
      }
    }
  `,
  [ShippingOptionsFragment],
);
