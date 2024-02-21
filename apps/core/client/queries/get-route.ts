import { client } from '..';
import { graphql } from '../generated';
import { Route } from '../generated/graphql';

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
        }
      }
    }
  }
`;

export const getRoute = async (path: string): Promise<Route> => {
  const query = graphql(GET_ROUTE_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { path },
  });

  return response.data.site.route;
};
