import { cookies } from 'next/headers';
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { client } from './client';
import { graphql } from './client/graphql';

const LoginMutation = graphql(`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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

const AssignCartToCustomerMutation = graphql(`
  mutation AssignCartToCustomer($assignCartToCustomerInput: AssignCartToCustomerInput!) {
    cart {
      assignCartToCustomer(input: $assignCartToCustomerInput) {
        cart {
          entityId
        }
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

export const Credentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const config = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.customerAccessToken) {
        token.customerAccessToken = user.customerAccessToken;
      }

      return token;
    },
    session({ session, token }) {
      if (token.customerAccessToken) {
        session.customerAccessToken = token.customerAccessToken;
      }

      return session;
    },
  },
  events: {
    async signIn({ user: { customerAccessToken } }) {
      const cookieStore = await cookies();
      const cookieCartId = cookieStore.get('cartId')?.value;

      if (cookieCartId) {
        try {
          await client.fetch({
            document: AssignCartToCustomerMutation,
            variables: {
              assignCartToCustomerInput: {
                cartEntityId: cookieCartId,
              },
            },
            customerAccessToken,
            fetchOptions: {
              cache: 'no-store',
            },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },
    async signOut(message) {
      const customerAccessToken = 'token' in message ? message.token?.customerAccessToken : null;

      if (customerAccessToken) {
        try {
          await client.fetch({
            document: LogoutMutation,
            variables: {},
            customerAccessToken,
            fetchOptions: {
              cache: 'no-store',
            },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = Credentials.parse(credentials);

        const response = await client.fetch({
          document: LoginMutation,
          variables: { email, password },
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

        // eslint-disable-next-line no-console
        console.dir(
          {
            customerId: result.customer.entityId,
            channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
            // customerAccessToken: result.customerAccessToken.value,
            // b2bAuthToken: process.env.B2B_AUTH_TOKEN,
          },
          { depth: null },
        );

        const b2bloginResponse = await fetch(
          ` https://api-b2b.bigcommerce.com/api/io/auth/customers/storefront`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              authToken: process.env.B2B_AUTH_TOKEN || '',
            },
            body: JSON.stringify({
              customerId: result.customer.entityId,
              channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
              customerAccessToken: {
                value: result.customerAccessToken.value,
                expiresAt: '2024-12-31T23:59:59.999Z',
              },
            }),
          },
        );

        // eslint-disable-next-line no-console
        console.dir(
          { status: b2bloginResponse.status, statusText: b2bloginResponse.statusText },
          { depth: null },
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const b2bLoginData = await b2bloginResponse.json();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-console
        console.dir({ b2bLoginData }, { depth: null });

        return {
          name: `${result.customer.firstName} ${result.customer.lastName}`,
          email: result.customer.email,
          customerAccessToken: result.customerAccessToken.value,
        };
      },
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
