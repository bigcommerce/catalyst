import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { anonymousCachePolicy } from '~/client/cache-policy';
import { BreadcrumbsWebPageFragment } from '~/components/breadcrumbs/fragment';

const NormalPageQuery = graphql(
  `
    query NormalPageQuery($id: ID!) {
      node(id: $id) {
        ... on NormalPage {
          __typename
          name
          ...BreadcrumbsFragment
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
  `,
  [BreadcrumbsWebPageFragment],
);

type Variables = VariablesOf<typeof NormalPageQuery>;

export const getWebpageData = cache(async (variables: Variables) => {
  const { data } = await client.fetch({
    document: NormalPageQuery,
    variables,
    fetchOptions: anonymousCachePolicy,
  });

  return data;
});
