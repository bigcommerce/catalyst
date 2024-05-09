import { client } from '..';
import { graphql } from '../graphql';

const GET_RAW_WEB_PAGE_CONTENT_QUERY = graphql(`
  query getRawWebPageContent($id: ID!) {
    node(id: $id) {
      __typename
      ... on RawHtmlPage {
        htmlBody
      }
    }
  }
`);

export const getRawWebPageContent = async (id: string) => {
  const response = await client.fetch({
    document: GET_RAW_WEB_PAGE_CONTENT_QUERY,
    variables: { id },
  });

  const node = response.data.node;

  if (node?.__typename !== 'RawHtmlPage') {
    throw new Error('Failed to fetch raw web page content');
  }

  return node;
};
