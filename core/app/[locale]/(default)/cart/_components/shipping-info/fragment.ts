import { graphql } from '~/client/graphql';

export const ShippingInfoFragment = graphql(`
  fragment ShippingInfoFragment on Checkout {
    entityId
    shippingConsignments {
      entityId
      selectedShippingOption {
        entityId
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
`);
