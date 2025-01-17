import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
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

type Variables = VariablesOf<typeof NormalPageQuery>;

export const getWebpageData = cache(async (id: Variables['id']) => {
  const { data } = await client.fetch({
    document: NormalPageQuery,
    variables: { id },
    fetchOptions: { next: { revalidate } },
  });

  return data;
});
