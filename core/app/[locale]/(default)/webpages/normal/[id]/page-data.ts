import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const NormalPageQuery = graphql(`
  query NormalPageQuery($id: ID!) {
    node(id: $id) {
      ... on NormalPage {
        __typename
        name
        htmlBody
        entityId
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

export const getWebpageData = cache(async (variables: { id: string }) => {
  const { data } = await client.fetch({
    document: NormalPageQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return data;
});
