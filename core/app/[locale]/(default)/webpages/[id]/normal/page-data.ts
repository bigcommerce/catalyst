import { cacheLife } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
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

async function getCachedWebpageData(locale: string, variables: Variables) {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: NormalPageQuery,
    variables,
    locale,
  });

  return data;
}

export const getWebpageData = cache(async (locale: string, variables: Variables) => {
  return getCachedWebpageData(locale, variables);
});
