import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsWebPageFragment } from '~/components/breadcrumbs/fragment';

const ContactPageQuery = graphql(
  `
    query ContactPageQuery($id: ID!) {
      node(id: $id) {
        __typename
        ... on ContactPage {
          entityId
          name
          ...BreadcrumbsFragment
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
    }
  `,
  [BreadcrumbsWebPageFragment],
);

type Variables = VariablesOf<typeof ContactPageQuery>;

const getCachedWebpageData = unstable_cache(
  async (locale: string, variables: Variables) => {
    const { data } = await client.fetch({
      document: ContactPageQuery,
      variables,
      locale,
    });

    return data;
  },
  ['get-contact-webpage-data'],
  { revalidate },
);

export const getWebpageData = cache(async (locale: string, variables: Variables) => {
  return getCachedWebpageData(locale, variables);
});
