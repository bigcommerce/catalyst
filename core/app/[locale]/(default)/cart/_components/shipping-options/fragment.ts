import { graphql } from '~/client/graphql';

export const ShippingOptionsFragment = graphql(`
  fragment ShippingOptionsFragment on CheckoutShippingConsignment {
    entityId
    availableShippingOptions {
      cost {
        value
      }
      description
      entityId
      isRecommended
    }
  }
`);
