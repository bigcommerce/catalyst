import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { ContactUsFragment } from './contact-us/fragment';

const WebPageQuery = graphql(
  `
    query WebPageQuery($id: ID!) {
      ...ContactUsFragment
      node(id: $id) {
        __typename
        ... on ContactPage {
          name
          htmlBody
          seo {
            pageTitle
            metaKeywords
            metaDescription
          }
        }
      }
    }
  `,
  [ContactUsFragment],
);

export const getWebpageData = cache(async (variables: { id: string }) => {
  const { data } = await client.fetch({
    document: WebPageQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return data;
});
