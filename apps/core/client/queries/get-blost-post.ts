import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

const GET_BLOG_POST_QUERY = /* GraphQL */ `
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
              url(width: 900)
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
`;

export const getBlogPost = cache(async (entityId: number) => {
  const query = graphql(GET_BLOG_POST_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { entityId },
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
