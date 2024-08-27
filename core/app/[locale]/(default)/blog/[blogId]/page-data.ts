import { cache } from 'react';
import { getWordPressPost } from '~/lib/wordpress/data-fetcher';

export const getBlogPageData = cache(
  async ({ entityId, locale }: { entityId: string; locale: string | undefined }) => {
    console.log('entityId', entityId)
    const blogPost = await getWordPressPost({ blogId: entityId.toString(), locale });

    if (!blogPost) {
      return null;
    }

    return {
      content: {
        blog: {
          post: { ...blogPost, entityId },
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
