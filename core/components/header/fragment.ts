import { FragmentOf, graphql } from '~/client/graphql';

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
            url: urlTemplate
            altText
          }
        }
      }
    }
    currencies(first: 25) {
      edges {
        node {
          code
          isTransactional
          isDefault
        }
      }
    }
  }
`);

export const HeaderLinksFragment = graphql(`
  fragment HeaderLinksFragment on Site {
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

export type Currency = NonNullable<
  NonNullable<FragmentOf<typeof HeaderFragment>>['currencies']['edges']
>[number]['node'];
export type CurrencyCode = Currency['code'];
