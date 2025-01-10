import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BlogPageQuery = graphql(`
  query BlogPageQuery($entityId: Int!) {
    site {
      content {
        blog {
          name
          path
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
    }
  }
`);

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

  return blog;
});
