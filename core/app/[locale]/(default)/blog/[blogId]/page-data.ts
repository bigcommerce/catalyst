import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { anonymousCachePolicy } from '~/client/cache-policy';

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

type Variables = VariablesOf<typeof BlogPageQuery>;

export const getBlogPageData = cache(async (variables: Variables) => {
  const response = await client.fetch({
    document: BlogPageQuery,
    variables,
    fetchOptions: anonymousCachePolicy,
  });

  const { blog } = response.data.site.content;

  if (!blog?.post) {
    return null;
  }

  return blog;
});
