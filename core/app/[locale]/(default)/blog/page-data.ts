import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BlogPostCardFragment } from '~/components/blog-post-card/fragment';

const BlogQuery = graphql(`
  query BlogQuery {
    site {
      content {
        blog {
          name
          description
        }
      }
    }
  }
`);

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

export const getBlog = cache(async () => {
  const response = await client.fetch({
    document: BlogQuery,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.content.blog;
});

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

    const format = await getFormatter();

    return {
      pageInfo: blog.posts.pageInfo,
      posts: removeEdgesAndNodes(blog.posts).map((post) => ({
        id: String(post.entityId),
        author: post.author,
        content: post.plainTextSummary,
        date: format.dateTime(new Date(post.publishedDate.utc)),
        image: post.thumbnailImage
          ? {
              src: post.thumbnailImage.url,
              alt: post.thumbnailImage.altText,
            }
          : undefined,
        href: `/blog/${post.entityId}`,
        title: post.name,
      })),
    };
  },
);

export async function getBlogMetaData() {
  const t = await getTranslations('Blog');
  const blog = await getBlog();

  return {
    title: blog?.name ?? t('title'),
    description:
      blog?.description && blog.description.length > 150
        ? `${blog.description.substring(0, 150)}...`
        : blog?.description,
  };
}
