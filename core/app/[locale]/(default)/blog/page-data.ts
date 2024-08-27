import { cache } from 'react';

import { getWordPressPosts } from '~/lib/wordpress/data-fetcher';

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
    let page = 1;
    
    if (before) {
      page = parseInt(before) - 1;
    }

    if (after) {
      page = parseInt(after);
    }

    const blogPosts = await getWordPressPosts({ tagId, perPage: limit, page, locale })

    if (!blogPosts) {
      return null;
    }

    return blogPosts;
  },
);