import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

interface BlogPostsFiltersInput {
  tagId?: string;
}

interface Pagination {
  limit?: number;
  before?: string;
  after?: string;
}

const GET_BLOG_POSTS_QUERY = graphql(`
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
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            edges {
              node {
                author
                entityId
                name
                plainTextSummary
                publishedDate {
                  utc
                }
                thumbnailImage {
                  url: urlTemplate
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getBlogPosts = cache(
  async ({ tagId, limit = 9, before, after }: BlogPostsFiltersInput & Pagination) => {
    const filterArgs = tagId ? { filters: { tags: [tagId] } } : {};
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: GET_BLOG_POSTS_QUERY,
      variables: { ...filterArgs, ...paginationArgs },
      fetchOptions: { next: { revalidate } },
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
