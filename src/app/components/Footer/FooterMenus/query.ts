import { graphql } from '../../../../lib/gql';

export const getCategoryMenuQuery = graphql(`
  query getCategoryMenu {
    site {
      categoryTree {
        ... on CategoryTreeItem {
          name
          path
        }
      }
    }
  }
`);

export const getBrandMenuQuery = graphql(`
  query getBrandMenu {
    site {
      brands(first: 5) {
        edges {
          node {
            name
            path
          }
        }
      }
    }
  }
`);
