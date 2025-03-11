import { graphql } from '~/client/graphql';

export const BlogPostCardFragment = graphql(`
  fragment BlogPostCardFragment on BlogPost {
    author
    entityId
    name
    path
    plainTextSummary
    publishedDate {
      utc
    }
    thumbnailImage {
      url: urlTemplate(lossy: true)
      altText
    }
  }
`);
