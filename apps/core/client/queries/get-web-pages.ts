import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';
import { ExistingResultType } from '../util';

export type AvailableWebPages = ExistingResultType<typeof getWebPages>;

const GET_WEB_PAGES_QUERY = graphql(`
  query getWebPages {
    site {
      content {
        pages(filters: { isVisibleInNavigation: true }) {
          edges {
            node {
              __typename
              name
              ... on RawHtmlPage {
                path
              }
              ... on ContactPage {
                path
              }
              ... on NormalPage {
                path
              }
              ... on BlogIndexPage {
                path
              }
              ... on ExternalLinkPage {
                link
              }
            }
          }
        }
      }
    }
  }
`);

export const getWebPages = cache(async () => {
  const response = await client.fetch({
    document: GET_WEB_PAGES_QUERY,
    fetchOptions: { next: { revalidate } },
  });

  const { pages } = response.data.site.content;

  if (!pages.edges?.length) {
    return [];
  }

  return removeEdgesAndNodes(pages);
});
