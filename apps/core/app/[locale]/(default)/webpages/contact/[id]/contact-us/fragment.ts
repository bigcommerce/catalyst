import { graphql } from '~/client/graphql';

export const ContactUsFragment = graphql(`
  fragment ContactUsFragment on Query {
    node(id: $id) {
      ... on ContactPage {
        entityId
        contactFields
      }
    }
    site {
      settings {
        reCaptcha {
          isEnabledOnStorefront
          siteKey
        }
      }
    }
  }
`);
