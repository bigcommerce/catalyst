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

const LoginWithTokenMutation = graphql(`
  mutation LoginWithCustomerLoginJwt($jwt: String!) {
    loginWithCustomerLoginJwt(jwt: $jwt) {
        customerAccessToken {
          value
        }
        customer {
          entityId
          firstName
          lastName
          email
        }
        redirectTo
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

export const Credentials = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('password'),
    email: z.string().email(),
    password: z.string().min(1),
  }),
  z.object({
    type: z.literal('jwt'),
    jwt: z.string(),
  }),
]);

interface LoginResult {
  customerAccessToken: { value: string };
  customer: {
    entityId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  redirectTo?: string;
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
      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.customerAccessToken) {
        token.customerAccessToken = user.customerAccessToken;
        if (user.redirectTo) {
          console.log('Setting redirectTo:', user.redirectTo);
          token.redirectTo = user.redirectTo;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.customerAccessToken) {
        session.customerAccessToken = token.customerAccessToken;
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
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
      const cookieStore = await cookies();
      const cookieCartId = cookieStore.get('cartId')?.value;

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
        type: { type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        jwt: { type: 'text' },
      },
      async authorize(credentials) {        
        try {
          const parsed = Credentials.parse(credentials);
          const cookieStore = await cookies();
          const cookieCartId = cookieStore.get('cartId')?.value;

          if (parsed.type === 'password') {
            const response = await client.fetch({
              document: LoginMutation,
              variables: { email: parsed.email, password: parsed.password },
              fetchOptions: {
                cache: 'no-store',
              },
            });

            if (response.errors?.length > 0) {
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

          if (parsed.type === 'jwt') {
            const response = await client.fetch({
              document: LoginWithTokenMutation,
              variables: { jwt: parsed.jwt },
              fetchOptions: {
                cache: 'no-store',
              },
            });

            if (response.errors?.length > 0) {
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
              redirectTo: result.redirectTo,
            };
          }

          return null;
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
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
    redirectTo?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    customerAccessToken?: string;
    redirectTo?: string;
  }
}
