import { cookies } from 'next/headers';
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { assignCartToCustomer } from './client/mutations/assign-cart-to-customer';
import { login } from './client/mutations/login';
import { unassignCartFromCustomer } from './client/mutations/unassign-cart-from-customer';

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
          await assignCartToCustomer(user.id, cookieCartId);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },
    async signOut() {
      const cookieCartId = cookies().get('cartId')?.value;

      if (cookieCartId) {
        try {
          await unassignCartFromCustomer(cookieCartId);
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

        const response = await login(email, password);

        if (!response.customer) {
          return null;
        }

        return {
          id: response.customer.entityId.toString(),
          name: `${response.customer.firstName} ${response.customer.lastName}`,
          email: response.customer.email,
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
