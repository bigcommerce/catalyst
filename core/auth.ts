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

const UnassignCartFromCustomerMutation = graphql(`
  mutation UnassignCartFromCustomer(
    $unassignCartFromCustomerInput: UnassignCartFromCustomerInput!
  ) {
    cart {
      unassignCartFromCustomer(input: $unassignCartFromCustomerInput) {
        cart {
          entityId
        }
      }
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
      if (user?.id) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const cookieCartId = cookies().get('cartId')?.value;

      if (cookieCartId && user.id) {
        try {
          await client.fetch({
            document: AssignCartToCustomerMutation,
            variables: {
              assignCartToCustomerInput: {
                cartEntityId: cookieCartId,
              },
            },
            customerId: user.id,
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
      const cookieCartId = cookies().get('cartId')?.value;

      const customerId = 'token' in message ? message.token?.id : null;

      if (customerId && cookieCartId) {
        try {
          await client.fetch({
            document: UnassignCartFromCustomerMutation,
            variables: {
              unassignCartFromCustomerInput: {
                cartEntityId: cookieCartId,
              },
            },
            customerId,
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

        const result = response.data.login;

        if (!result.customer) {
          return null;
        }

        return {
          id: result.customer.entityId.toString(),
          name: `${result.customer.firstName} ${result.customer.lastName}`,
          email: result.customer.email,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

const { handlers, auth, signIn, signOut } = NextAuth(config);

const getSessionCustomerId = async () => {
  try {
    const session = await auth();

    return session?.user.id;
  } catch {
    // No empty
  }
};

export { handlers, auth, signIn, signOut, getSessionCustomerId };

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
