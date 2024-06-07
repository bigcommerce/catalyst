import { graphql, HttpResponse } from 'msw';

let channel = '';
if (process.env.BIGCOMMERCE_CHANNEL_ID && process.env.BIGCOMMERCE_CHANNEL_ID !== '1') {
  channel = `-${process.env.BIGCOMMERCE_CHANNEL_ID}`;
}

const gql = graphql.link(
  `https://store-${process.env.BIGCOMMERCE_STORE_HASH ?? ''}${channel}.${process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com'}/graphql`,
);

export const handlers = [
  // More operations - https://mswjs.io/docs/api/graphql
  gql.query('RootLayoutMetadataQuery', ({ query }) => {
    console.log('Intercepted a "RootLayoutMetadataQuery" query:', query);
    return HttpResponse.json({
      data: {
        site: {
          settings: {
            storeName: 'Intercepted Store Name',
          },
        },
      },
    });
  }),
  gql.operation(({ query, variables }) => {
    // Intercept all GraphQL operations for debugging purposes.
    // console.log('Intercepted a GraphQL query:', query);
  }),
];
