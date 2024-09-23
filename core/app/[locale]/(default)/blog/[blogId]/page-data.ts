import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { SharingLinksFragment } from './_components/sharing-links';

const BlogPageQuery = graphql(
  `
    query BlogPageQuery($entityId: Int!) {
      site {
        content {
          blog {
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
                url: urlTemplate(lossy: true)
              }
              seo {
                pageTitle
                metaDescription
                metaKeywords
              }
            }
          }
        }
        ...SharingLinksFragment
      }
    }
  `,
  [SharingLinksFragment],
);

export const getBlogPageData = cache(async ({ entityId }: { entityId: number }) => {
  const response = await client.fetch({
    document: BlogPageQuery,
    variables: { entityId },
    fetchOptions: { next: { revalidate } },
  });

  const { blog } = response.data.site.content;

  if (!blog?.post) {
    return null;
  }

  return response.data.site;
});
