import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

interface BlogPostsFiltersInput {
  tagId?: string;
}

interface Pagination {
  limit?: number;
  before?: string;
  after?: string;
}

const GET_BLOG_POSTS_QUERY = /* GraphQL */ `
  query getBlogPosts(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filters: BlogPostsFiltersInput
  ) {
    site {
      content {
        blog {
          id
          isVisibleInNavigation
          name
          posts(first: $first, after: $after, last: $last, before: $before, filters: $filters) {
            pageInfo {
              ...PageDetails
            }
            edges {
              node {
                author
                entityId
                htmlBody
                name
                path
                plainTextSummary
                publishedDate {
                  utc
                }
                thumbnailImage {
                  url(width: 300)
                  altText
                }
                seo {
                  metaKeywords
                  metaDescription
                  pageTitle
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getBlogPosts = cache(
  async ({ tagId, limit = 9, before, after }: BlogPostsFiltersInput & Pagination) => {
    const filterArgs = tagId ? { filters: { tags: [tagId] } } : {};
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const query = graphql(GET_BLOG_POSTS_QUERY);

    const response = await client.fetch({
      document: query,
      variables: { ...filterArgs, ...paginationArgs },
    });

    const { blog } = response.data.site.content;

    if (!blog) {
      return null;
    }

    return {
      ...blog,
      posts: {
        pageInfo: blog.posts.pageInfo,
        items: removeEdgesAndNodes(blog.posts),
      },
    };
  },
);
