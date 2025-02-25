import { cache } from 'react';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { anonymousCachePolicy } from '~/client/cache-policy';
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
  [BreadcrumbsWebPageFragment],
);

type Variables = VariablesOf<typeof ContactPageQuery>;

export const getWebpageData = cache(async (variables: Variables) => {
  const { data } = await client.fetch({
    document: ContactPageQuery,
    variables,
    fetchOptions: anonymousCachePolicy,
  });

  return data;
});
