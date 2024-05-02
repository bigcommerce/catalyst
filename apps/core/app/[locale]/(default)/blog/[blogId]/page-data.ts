import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { SharingLinksFragment } from './_components/sharing-links';

const BlogPostPageQuery = graphql(
  `
    query BlogPostPageQuery($entityId: Int!) {
      site {
        content {
          blog {
            isVisibleInNavigation
            post(entityId: $entityId) {
              author
              htmlBody
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
                pageTitle
              }
              ...SharingLinksFragment
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
  [SharingLinksFragment],
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
