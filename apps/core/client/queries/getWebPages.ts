import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';
import { ExistingResultType } from '../util';
import { string } from 'zod';

export type WebContentPages = ExistingResultType<typeof getWebPages>;

export type WebPageFilters = {
  first: number;  
  after?: string;
  navigationOnly?: boolean;
};

export const GET_WEB_PAGES_QUERY = /* GraphQL */ `
  query getWebPages($filters: WebPagesFiltersInput, $first: Int, $after: String) {
    site {
      content {
        pages(filters: $filters, first: $first, after: $after) {
          pageInfo {
            ...PageDetails
          }
          edges {
            node {
              name
              __typename
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

export const getWebPages = cache(async ({
  first = 5,
  after,
  navigationOnly,
}:WebPageFilters) => {
  const query = graphql(GET_WEB_PAGES_QUERY);

  const filters = {...navigationOnly && { isVisibleInNavigation: navigationOnly }};

  const variables = { filters, first, after }

  const response = await client.fetch({
    document: query,
    variables
  });

  const { pages } = response.data.site.content;

  if (!pages.edges?.length) {
    return [];
  }

  return removeEdgesAndNodes(pages);
});
