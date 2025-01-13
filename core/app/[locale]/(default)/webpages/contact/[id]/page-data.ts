import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const ContactPageQuery = graphql(
  `
    query ContactPageQuery($id: ID!) {
      node(id: $id) {
        __typename
        ... on ContactPage {
          entityId
          name
          path
          contactFields
          htmlBody
          seo {
            pageTitle
            metaKeywords
            metaDescription
          }
        }
      }
      site {
        settings {
          reCaptcha {
            isEnabledOnStorefront
            siteKey
          }
        }
      }
    }
  `,
  [],
);

export const getWebpageData = cache(async (variables: { id: string }) => {
  const { data } = await client.fetch({
    document: ContactPageQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return data;
});
