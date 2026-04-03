import { graphql } from '~/client/graphql';

export const GiftCertificateSettingsFragment = graphql(`
  fragment GiftCertificateSettingsFragment on GiftCertificateSettings {
    __typename
    isEnabled
    currencyCode
    expiry {
      unit
      value
    }
    ... on FixedAmountGiftCertificateSettings {
      amounts {
        value
        formattedV2
      }
    }
    ... on CustomAmountGiftCertificateSettings {
      minimumAmount {
        value
        formattedV2
      }
      maximumAmount {
        value
        formattedV2
      }
    }
  }
`);
