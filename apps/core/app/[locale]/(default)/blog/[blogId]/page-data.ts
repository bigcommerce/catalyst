import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { SharingLinksFragment } from './_components/sharing-links';

const PageQuery = graphql(
  `
    query PageQuery($entityId: Int!) {
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
            }
          }
        }
        ...SharingLinksFragment
      }
    }
  `,
  [SharingLinksFragment],
);

export const getPageData = cache(async ({ entityId }: { entityId: number }) => {
  const response = await client.fetch({
    document: PageQuery,
    variables: { entityId },
    fetchOptions: { next: { revalidate } },
  });

  const { blog } = response.data.site.content;

  if (!blog?.post) {
    return null;
  }

  return response.data.site;
});
