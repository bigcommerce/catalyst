import { unstable_cache } from 'next/cache';
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

const getCachedBlogPageData = unstable_cache(
  async (locale: string, variables: Variables) => {
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
  },
  ['get-blog-page-data'],
  { revalidate },
);

export const getBlogPageData = cache(async (locale: string, variables: Variables) => {
  return getCachedBlogPageData(locale, variables);
});
