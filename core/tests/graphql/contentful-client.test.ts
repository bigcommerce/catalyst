import client from '~/lib/contentful-client';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

describe('Contentful Apollo Client', () => {
  it('should be an instance of ApolloClient', () => {
    expect(client).toBeInstanceOf(ApolloClient);
  });

  it('should have the correct link configuration', () => {
    const link = client.link as HttpLink;
    expect(link).toBeDefined();
    expect((link as any).options.uri).toContain('https://graphql.contentful.com/content/v1/spaces/');
  });

  it('should use InMemoryCache', () => {
    expect(client.cache).toBeInstanceOf(InMemoryCache);
  });
});
