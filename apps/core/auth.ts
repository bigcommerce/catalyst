import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { login } from './client/mutations/login';

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
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  return session.user.id;
};

export { handlers, auth, signIn, signOut, update, getSessionCustomerId };
