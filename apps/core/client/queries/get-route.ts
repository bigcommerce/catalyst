import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_ROUTE_QUERY = graphql(`
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
`);

export const getRoute = async (path: string) => {
  const response = await client.fetch({
    document: GET_ROUTE_QUERY,
    variables: { path },
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.route;
};
