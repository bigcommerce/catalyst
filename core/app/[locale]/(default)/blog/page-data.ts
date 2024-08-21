import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BlogPostCardFragment } from '~/components/blog-post-card/fragment';

const BlogPostsPageQuery = graphql(
  `
    query BlogPostsPageQuery(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $filters: BlogPostsFiltersInput
    ) {
      site {
        content {
          blog {
            name
            description
            posts(first: $first, after: $after, last: $last, before: $before, filters: $filters) {
              edges {
                node {
                  entityId
                  ...BlogPostCardFragment
                }
              }
              pageInfo {
                ...PaginationFragment
              }
            }
          }
        }
      }
    }
  `,
  [BlogPostCardFragment, PaginationFragment],
);

interface BlogPostsFiltersInput {
  tagId?: string;
}

interface Pagination {
  limit?: number;
  before?: string;
  after?: string;
}

export const getBlogPosts = cache(
  async ({ tagId, limit = 9, before, after }: BlogPostsFiltersInput & Pagination) => {
    const filterArgs = tagId ? { filters: { tags: [tagId] } } : {};
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: BlogPostsPageQuery,
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
