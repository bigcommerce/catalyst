import { graphql } from '~/client/graphql';

export const CouponCodeFragment = graphql(`
  fragment CouponCodeFragment on Checkout {
    entityId
    coupons {
      code
      discountedAmount {
        value
      }
    }
    cart {
      currencyCode
    }
  }
`);
