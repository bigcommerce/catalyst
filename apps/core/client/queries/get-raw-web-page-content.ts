import { client } from '..';
import { graphql } from '../generated';

export const GET_RAW_WEB_PAGE_CONTENT_QUERY = /* GraphQL */ `
  query getRawWebPageContent($id: ID!) {
    node(id: $id) {
      __typename
      ... on RawHtmlPage {
        htmlBody
      }
    }
  }
`;

export const getRawWebPageContent = async (id: string) => {
  const query = graphql(GET_RAW_WEB_PAGE_CONTENT_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { id },
  });

  const node = response.data.node;

  if (node?.__typename !== 'RawHtmlPage') {
    throw new Error('Failed to fetch raw web page content');
  }

  return node;
};
