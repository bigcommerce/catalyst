import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';
import { ExistingResultType } from '../util';

export type AvailableWebPages = ExistingResultType<typeof getWebPages>;

export const GET_WEB_PAGES_QUERY = /* GraphQL */ `
  query getWebPages {
    site {
      content {
        pages {
          edges {
            node {
              ...WebPage
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
`;

export const getWebPages = cache(async () => {
  const query = graphql(GET_WEB_PAGES_QUERY);

  const response = await client.fetch({
    document: query,
  });

  const { pages } = response.data.site.content;

  if (!pages.edges?.length) {
    return [];
  }

  return removeEdgesAndNodes(pages);
});
