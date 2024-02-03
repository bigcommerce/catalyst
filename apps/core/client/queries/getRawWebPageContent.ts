import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

export const GET_RAW_WEB_PAGE_CONTENT_QUERY = /* GraphQL */ `
  query getRawWebPageContent($id: ID!) {
    node(id: $id) {
      ... on RawHtmlPage {
        htmlBody
      }
    }
  }
`;

export const getRawWebPageContent = cache(async (id: String) => {
  const query = graphql(GET_RAW_WEB_PAGE_CONTENT_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { id },
  });

  const webpage = response.data.node;

  if (!webpage) {
    return undefined;
  }

  return webpage;
});
