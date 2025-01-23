import { graphql } from '~/client/graphql';

export const BreadcrumbsCategoryFragment = graphql(`
  fragment BreadcrumbsFragment on Category {
    breadcrumbs(depth: 5) {
      edges {
        node {
          name
          path
        }
      }
    }
  }
`);

export const BreadcrumbsWebPageFragment = graphql(`
  fragment BreadcrumbsFragment on WebPage {
    breadcrumbs(depth: 8) {
      edges {
        node {
          name
          path
        }
      }
    }
  }
`);
