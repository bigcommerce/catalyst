import { cookies } from 'next/headers';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { assignCartToCustomer } from './client/mutations/assign-cart-to-customer';
import { login } from './client/mutations/login';
import { unassignCartFromCustomer } from './client/mutations/unassign-cart-from-customer';

export const Credentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: number;
    };
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
    session({ session, token }) {
      session.user ||= {};

      session.user.id = token.sub ? parseInt(token.sub, 10) : undefined;

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const cookieCartId = cookies().get('cartId')?.value;

      if (cookieCartId) {
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

        const customer = await login(email, password);

        if (!customer) {
          return null;
        }

        return {
          id: customer.entityId.toString(),
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

const { handlers, auth, signIn, signOut, update } = NextAuth(config);

const getSessionCustomerId = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return;
    }

    return session.user.id;
  } catch {
    // No empty
  }
};

export { handlers, auth, signIn, signOut, update, getSessionCustomerId };
