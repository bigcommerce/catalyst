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
        expiresAt
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

      if (user?.b2bToken) {
        token.b2bToken = user?.b2bToken
      }

      return token;
    },
    session({ session, token }) {
      if (token?.b2bToken){
        //@ts-ignore
        session.b2bToken = token?.b2bToken;
      }
      
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

        const user = {
            id: result.customer.entityId.toString(),
            name: `${result.customer.firstName} ${result.customer.lastName}`,
            email: result.customer.email,
            customerAccessToken: result.customerAccessToken.value,
            expiresAt: result.customerAccessToken.expiresAt,
        }

        if (!process.env.B2B_API_HOST || !process.env.B2B_API_TOKEN) {
          return user;
        }

        try {
          const payload = {
            channelId: Number(process.env.BIGCOMMERCE_CHANNEL_ID),
            customerId:  result.customer.entityId,
            customerAccessToken: {
              value: result.customerAccessToken.value,
              expiresAt: result.customerAccessToken.expiresAt,
            },
          }

          const response = await client.b2bFetch<{
            data: {
              token: string[]
            }
          }>(
            '/api/io/auth/customers/storefront',
            {
              method: 'POST',
              body: JSON.stringify(payload),
              headers: {
                'Content-Type': 'application/json',
                authtoken: process.env.B2B_API_TOKEN || '',
              },
            },
          );

          const b2bToken = response.data?.token?.[0];

          if (b2bToken) 
            return {...user, b2bToken };

          return user
        } catch (e) {
          e
          return user; 
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
    b2bToken?: string
  }

  interface User {
    name?: string | null;
    email?: string | null;
    customerAccessToken?: string;
    expiresAt?: number;
    b2bToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    customerAccessToken?: string;
  }
}

declare global {
  interface Window {
    b2b: {
      utils: {
        user: {
          getProfile: () => { role: number };
          loginWithB2BStorefrontToken: (b2bStorefrontJWTToken: string) => Promise<void>;
          logout: (params?: { handleError?: (error: any) => any }) => Promise<void>;
          getB2BToken: () => string;
          getAllowedRoutes: () => any[]
        };
      };
    };
  }
}
