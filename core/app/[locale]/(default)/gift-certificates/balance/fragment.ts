import { graphql } from '~/client/graphql';

export const GiftCertificateFragment = graphql(`
  fragment GiftCertificateFragment on GiftCertificate {
    code
    currencyCode
    status
    theme
    sender {
      name
    }
    recipient {
      name
    }
    amount {
      value
      formattedV2
    }
    balance {
      value
      formattedV2
    }
    purchasedAt {
      utc
    }
    expiresAt {
      utc
    }
  }
`);
