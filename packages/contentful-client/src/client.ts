export async function createClient(
  contentfulSpaceId: string,
  contentfulAccessToken: string,
  query: string,
  variables?: object
): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${contentfulSpaceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${contentfulAccessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    }
  ).then((response) => response.json());
}
