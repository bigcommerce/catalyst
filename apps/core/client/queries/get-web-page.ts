import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const WEB_PAGE_FRAGMENT = graphql(`
  fragment WebPage on WebPage {
    __typename
    entityId
    name
    seo {
      pageTitle
      metaKeywords
      metaDescription
    }
  }
`);

const GET_WEB_PAGE_QUERY = graphql(
  `
    query getWebPage($path: String!) {
      site {
        route(path: $path) {
          node {
            ...WebPage
            ... on ContactPage {
              contactFields
              htmlBody
            }
            ... on NormalPage {
              htmlBody
            }
          }
        }
      }
    }
  `,
  [WEB_PAGE_FRAGMENT],
);

export interface Options {
  path: string;
}

export const getWebPage = cache(async ({ path }: Options) => {
  const response = await client.fetch({
    document: GET_WEB_PAGE_QUERY,
    variables: { path },
    fetchOptions: { next: { revalidate } },
  });

  const webpage = response.data.site.route.node;

  if (!webpage) {
    return undefined;
  }

  switch (webpage.__typename) {
    case 'ContactPage':
    case 'NormalPage':
      return webpage;

    default:
      return undefined;
  }
});
