import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

export const SEOFragment = graphql(`
  fragment SEOFragment on BlogPost {
    seo {
      metaKeywords
      metaDescription
      pageTitle
    }
  }
`);

const BlogPostPageQuery = graphql(
  `
    query BlogPostPageQuery($entityId: Int!) {
      site {
        content {
          blog {
            isVisibleInNavigation
            post(entityId: $entityId) {
              entityId
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
              ...SEOFragment
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
  `,
  [SEOFragment],
);

export const getBlogPost = cache(async ({ entityId }: { entityId: number }) => {
  const response = await client.fetch({
    document: BlogPostPageQuery,
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
