import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
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

type Variables = VariablesOf<typeof ContactPageQuery>;

export const getWebpageData = cache(async (id: Variables['id']) => {
  const { data } = await client.fetch({
    document: ContactPageQuery,
    variables: { id },
    fetchOptions: { next: { revalidate } },
  });

  return data;
});
