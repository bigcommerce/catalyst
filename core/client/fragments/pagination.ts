import { graphql } from '../graphql';

export const PaginationFragment = graphql(`
  fragment PaginationFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`);
