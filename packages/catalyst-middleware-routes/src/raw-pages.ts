/**
 * Built-in raw HTML page content fetching
 * Self-contained with no external dependencies except the GraphQL client
 */

const GET_RAW_WEB_PAGE_CONTENT_QUERY = `
  query getRawWebPageContent($id: ID!) {
    node(id: $id) {
      __typename
      ... on RawHtmlPage {
        htmlBody
      }
    }
  }
`;

/**
 * Get raw HTML page content from BigCommerce
 */
export async function getRawPageContent(
  client: any,
  id: string
): Promise<{ htmlBody: string }> {
  const response = await client.fetch({
    document: GET_RAW_WEB_PAGE_CONTENT_QUERY,
    variables: { id },
  });

  const node = response.data.node;

  if (node?.__typename !== 'RawHtmlPage') {
    throw new Error('Failed to fetch raw web page content');
  }

  return { htmlBody: node.htmlBody };
}