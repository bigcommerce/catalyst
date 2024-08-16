import { cache } from 'react';
import { getNewsPost } from '~/lib/strapi/data-fetcher';

export const getBlogPageData = cache(
  async ({ entityId, locale }: { entityId: number; locale: string | undefined }) => {
    const blogPost = await getNewsPost({ blogId: entityId.toString(), locale });

    if (!blogPost) {
      return null;
    }

    return {
      content: {
        blog: {
          post: {...blogPost, entityId },
        },
      },
      settings: {
        url: {
          vanityUrl: blogPost.vanityUrl,
        },
      },
    };
  },
);
