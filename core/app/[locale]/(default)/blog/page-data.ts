import { cache } from 'react';

import { getNewsPosts } from '~/lib/strapi/data-fetcher';

interface BlogPostsFiltersInput {
  tagId?: string;
  locale?: string;
}

interface Pagination {
  limit?: number;
  before?: string;
  after?: string;
}

export const getBlogPosts = cache(
  async ({ tagId, limit = 9, before, after, locale }: BlogPostsFiltersInput & Pagination) => {
    const blogPosts = await getNewsPosts({ tagId, limit, before, after, locale })

    if (!blogPosts) {
      return null;
    }

    return blogPosts;
  },
);
