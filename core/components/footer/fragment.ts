import { graphql } from '~/client/graphql';

export const FooterFragment = graphql(`
  fragment FooterFragment on Site {
    settings {
      storeName
      contact {
        address
        phone
      }
      socialMediaLinks {
        name
        url
      }
      logoV2 {
        __typename
        ... on StoreTextLogo {
          text
        }
        ... on StoreImageLogo {
          image {
            url: urlTemplate(lossy: true)
            altText
          }
        }
      }
    }
    content {
      pages(filters: { isVisibleInNavigation: true }) {
        edges {
          node {
            __typename
            name
            ... on RawHtmlPage {
              path
            }
            ... on ContactPage {
              path
            }
            ... on NormalPage {
              path
            }
            ... on BlogIndexPage {
              path
            }
            ... on ExternalLinkPage {
              link
            }
          }
        }
      }
    }
    brands(first: 5) {
      edges {
        node {
          entityId
          name
          path
        }
      }
    }
    categoryTree {
      name
      path
    }
  }
`);
