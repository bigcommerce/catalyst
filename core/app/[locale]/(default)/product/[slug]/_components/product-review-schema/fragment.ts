import { graphql } from '~/client/graphql';

export const ProductReviewSchemaFragment = graphql(`
  fragment ProductReviewSchemaFragment on Review {
    author {
      name
    }
    title
    text
    rating
    createdAt {
      utc
    }
  }
`);
