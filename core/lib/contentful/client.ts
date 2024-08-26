import { cacheExchange, Client, fetchExchange } from '@urql/core';
import { strict } from 'assert';
import { initGraphQLTada } from 'gql.tada';

import type { introspection } from '~/contentful-graphql';

export const contentfulGraphql = initGraphQLTada<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    DateTime: string;
  };
}>();

const getContentfulGraphqlEndpoint = () => {
  strict(process.env.CONTENTFUL_SPACE_ID, 'CONTENTFUL_SPACE_ID environment variable is required');

  return `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`;
};

const getContentfulAccessToken = () => {
  strict(
    process.env.CONTENTFUL_ACCESS_TOKEN,
    'CONTENTFUL_ACCESS_TOKEN environment variable is required',
  );

  return process.env.CONTENTFUL_ACCESS_TOKEN;
};

export const contentfulClient = new Client({
  url: getContentfulGraphqlEndpoint(),
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: {
      Authorization: `Bearer ${getContentfulAccessToken()}`,
    },

    // @todo implement better cache strategy
    cache: 'no-cache',
  }),

  /**
   * requestPolicy overrides cache property in fetchOptions
   */
  requestPolicy: 'cache-and-network',
});
