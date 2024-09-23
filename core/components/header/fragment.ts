import { graphql } from '~/client/graphql';

export const HeaderFragment = graphql(`
  fragment HeaderFragment on Site {
    settings {
      storeName
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
    categoryTree {
      name
      path
      children {
        name
        path
        children {
          name
          path
        }
      }
    }
  }
`);
