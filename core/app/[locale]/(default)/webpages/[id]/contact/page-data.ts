import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
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
  async (variables: Variables, locale: string) => {
    const { data } = await client.fetch({
      document: ContactPageQuery,
      variables,
      locale,
      fetchOptions: { cache: 'no-store' },
    });

    return data;
  },
  ['contact-webpage-data'],
  { revalidate },
);

export const getWebpageData = cache(async (variables: Variables) => {
  const locale = await getLocale();

  return getCachedWebpageData(variables, locale);
});
