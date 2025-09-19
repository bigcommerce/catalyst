import { createClient } from '@bigcommerce/catalyst-client';
import { initGraphQLTada } from 'gql.tada';
import { NextAuthConfig, User } from 'next-auth';

export type Client = ReturnType<typeof createClient>;
export type GraphQL = ReturnType<typeof initGraphQLTada>;

export interface BigCommerceAuthConfig {
  client: Client;
  graphql: GraphQL;
  userConfig: NextAuthConfig;
}

declare module 'next-auth' {
  interface Session {
    user?: User;
  }

  interface User {
    name?: string | null;
    email?: string | null;
    cartId?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
    cartTransitionResult?: 'cartRestored' | 'cartCombined' | null;
  }

  interface AnonymousUser {
    cartId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    user?: User;
  }
}
