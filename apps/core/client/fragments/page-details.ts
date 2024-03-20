import { graphql } from '../graphql';

export const PAGE_DETAILS_FRAGMENT = graphql(`
  fragment PageDetails on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`);
