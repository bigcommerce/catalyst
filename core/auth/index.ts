import { cookies } from 'next/headers';
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { client } from '../client';
import { graphql } from '../client/graphql';
import { decodeJwt } from 'jose';

const LoginMutation = graphql(`
  mutation Login($email: String!, $password: String!, $cartEntityId: String) {
    login(email: $email, password: $password, guestCartEntityId: $cartEntityId) {
      customerAccessToken {
        value
      }
      customer {
        entityId
        firstName
        lastName
        email
      }
    }
  }
`);

const LoginWithTokenMutation = graphql(`
  mutation LoginWithCustomerLoginJwt($jwt: String!, $cartEntityId: String) {
    loginWithCustomerLoginJwt(jwt: $jwt, guestCartEntityId: $cartEntityId) {
        customerAccessToken {
          value
        }
        customer {
          entityId
          firstName
          lastName
          email
        }
    }
  }
`);

const LogoutMutation = graphql(`
  mutation LogoutMutation {
    logout {
      result
    }
  }
`);

const PasswordCredentials = z.object({
  type: z.literal('password'),
  email: z.string().email(),
  password: z.string().min(1),
});

const JwtCredentials = z.object({
  type: z.literal('jwt'),
  jwt: z.string(),
});

export const Credentials = z.discriminatedUnion('type', [PasswordCredentials, JwtCredentials]);

interface LoginResult {
  customerAccessToken: { value: string };
  customer: {
    entityId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

type AuthorizeResult = {
  name: string;
  email: string;
  customerAccessToken: string;
} | null;

async function loginWithPassword(email: string, password: string, cartEntityId?: string) {
  const response = await client.fetch({
    document: LoginMutation,
    variables: { email, password, cartEntityId },
    fetchOptions: {
      cache: 'no-store',
    },
  });

  if (response.errors && response.errors.length > 0) {
    return null;
  }

  const result = response.data.login;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
  };
}

async function loginWithJwt(jwt: string, cartEntityId?: string) {
  const claims = decodeJwt(jwt);
  const channelId = claims.channel_id?.toString() || process.env.BIGCOMMERCE_CHANNEL_ID;
  const impersonatorId = claims.impersonator_id?.toString() || null;
  const response = await client.fetch({
    document: LoginWithTokenMutation,
    variables: { jwt, cartEntityId },
    channelId,
    fetchOptions: {
      cache: 'no-store',
    },
  });

  if (response.errors && response.errors.length > 0) {
    return null;
  }

  const result = response.data.loginWithCustomerLoginJwt;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
  };
}

async function authorizeUser(credentials: unknown): Promise<AuthorizeResult> {
  const parsed = Credentials.parse(credentials);
  const cookieStore = await cookies();
  const cartEntityId = cookieStore.get('cartId')?.value;

  switch (parsed.type) {
    case 'password': {
      const { email, password } = parsed;
      return loginWithPassword(email, password, cartEntityId);
    }

    case 'jwt': {
      const { jwt } = parsed;
      return loginWithJwt(jwt, cartEntityId);
    }

    default:
      return null;
  }
}

const config = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user?.customerAccessToken) {
        token.customerAccessToken = user.customerAccessToken;
      }

      return token;
    },
    session({ session, token }) {
      if (token.customerAccessToken) {
        session.customerAccessToken = token.customerAccessToken as string;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const customerAccessToken = 'token' in message ? message.token?.customerAccessToken : null;

      if (customerAccessToken) {
        try {
          await client.fetch({
            document: LogoutMutation,
            variables: {},
            customerAccessToken: customerAccessToken as string,
            fetchOptions: {
              cache: 'no-store',
            },
          });
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        type: { type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        jwt: { type: 'text' },
      },
      authorize: authorizeUser,
    }),
  ],
} satisfies NextAuthConfig;

const { handlers, auth, signIn, signOut } = NextAuth(config);

const getSessionCustomerAccessToken = async () => {
  try {
    const session = await auth();

    return session?.customerAccessToken;
  } catch {
    // No empty
  }
};

export { handlers, auth, signIn, signOut, getSessionCustomerAccessToken };

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'];
    customerAccessToken?: string;
  }

  interface User {
    name?: string | null;
    email?: string | null;
    customerAccessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    customerAccessToken?: string;
  }
}
