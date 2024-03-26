import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_BLOG_POST_QUERY = graphql(`
  query getBlogPost($entityId: Int!) {
    site {
      content {
        blog {
          isVisibleInNavigation
          post(entityId: $entityId) {
            author
            htmlBody
            id
            name
            publishedDate {
              utc
            }
            tags
            thumbnailImage {
              altText
              url: urlTemplate
            }
            seo {
              metaKeywords
              metaDescription
              pageTitle
            }
          }
        }
      }
      settings {
        url {
          vanityUrl
        }
      }
    }
  }
`);

export const getBlogPost = cache(async (entityId: number) => {
  const response = await client.fetch({
    document: GET_BLOG_POST_QUERY,
    variables: { entityId },
    fetchOptions: { next: { revalidate } },
  });

  const { blog } = response.data.site.content;

  if (!blog?.post) {
    return null;
  }

  const { isVisibleInNavigation, post } = blog;

  return {
    ...post,
    isVisibleInNavigation,
    vanityUrl: response.data.site.settings?.url.vanityUrl,
  };
});
