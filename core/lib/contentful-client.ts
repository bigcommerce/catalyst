import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const contentfulAccessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

const client = new ApolloClient({
  link: new HttpLink({
    uri: `https://graphql.contentful.com/content/v1/spaces/${contentfulSpaceId}/environments/master`,
    headers: {
      Authorization: `Bearer ${contentfulAccessToken}`,
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
