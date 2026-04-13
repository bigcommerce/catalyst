import { cacheLife } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
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
            path
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

type Variables = VariablesOf<typeof BlogPageQuery>;

async function getCachedBlogPageData(locale: string, variables: Variables) {
  'use cache';

  cacheLife({ revalidate });

  const response = await client.fetch({
    document: BlogPageQuery,
    variables,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  const { blog } = response.data.site.content;

  if (!blog?.post) {
    return null;
  }

  return blog;
}

export const getBlogPageData = cache(async (locale: string, variables: Variables) => {
  return getCachedBlogPageData(locale, variables);
});
