import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { unstable_cache } from 'next/cache';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BlogQuery = graphql(`
  query BlogQuery {
    site {
      content {
        blog {
          name
          description
          path
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
  [PaginationFragment],
);

interface BlogPostsFiltersInput {
  tag: string | null;
}

interface Pagination {
  limit: number;
  before: string | null;
  after: string | null;
}

const getCachedBlog = unstable_cache(
  async (locale: string) => {
    const response = await client.fetch({
      document: BlogQuery,
      locale,
    });

    return response.data.site.content.blog;
  },
  ['get-blog'],
  { revalidate },
);

export const getBlog = cache(async (locale: string) => {
  return getCachedBlog(locale);
});

const getCachedBlogPosts = unstable_cache(
  async (locale: string, { tag, limit = 9, before, after }: BlogPostsFiltersInput & Pagination) => {
    const filterArgs = tag ? { filters: { tags: [tag] } } : {};
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: BlogPostsPageQuery,
      variables: { ...filterArgs, ...paginationArgs },
      locale,
    });

    const { blog } = response.data.site.content;

    if (!blog) {
      return null;
    }

    return {
      pageInfo: blog.posts.pageInfo,
      posts: removeEdgesAndNodes(blog.posts).map((post) => ({
        id: String(post.entityId),
        author: post.author,
        content: post.plainTextSummary,
        dateUtc: post.publishedDate.utc,
        image: post.thumbnailImage
          ? {
              src: post.thumbnailImage.url,
              alt: post.thumbnailImage.altText,
            }
          : undefined,
        href: post.path,
        title: post.name,
      })),
    };
  },
  ['get-blog-posts'],
  { revalidate },
);

export const getBlogPosts = cache(
  async (locale: string, { tag, limit = 9, before, after }: BlogPostsFiltersInput & Pagination) => {
    const raw = await getCachedBlogPosts(locale, { tag, limit, before, after });

    if (!raw) {
      return null;
    }

    const format = await getFormatter();

    return {
      pageInfo: raw.pageInfo,
      posts: raw.posts.map(({ dateUtc, ...post }) => ({
        ...post,
        date: format.dateTime(new Date(dateUtc)),
      })),
    };
  },
);
