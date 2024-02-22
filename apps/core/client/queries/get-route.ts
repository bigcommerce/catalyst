import { client } from '..';
import { graphql } from '../generated';
import { revalidate } from '../revalidate-target';

export const GET_ROUTE_QUERY = /* GraphQL */ `
  query getRoute($path: String!) {
    site {
      route(path: $path) {
        redirect {
          __typename
          to {
            __typename
          }
          toUrl
        }
        node {
          __typename
          ... on Product {
            entityId
          }
          ... on Category {
            entityId
          }
          ... on Brand {
            entityId
          }
          ... on RawHtmlPage {
            id
          }
        }
      }
    }
  }
`;

export const getRoute = async (path: string) => {
  const query = graphql(GET_ROUTE_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { path },
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.route;
};
