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
    currencies(first: 10) {
      edges {
        node {
          code
        }
      }
    }
  }
`);

export type Currency = NonNullable<
  NonNullable<FragmentOf<typeof HeaderFragment>>['currencies']['edges']
>[number]['node'];
export type CurrencyCode = Currency['code'];
