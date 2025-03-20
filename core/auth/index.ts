import { decodeJwt } from 'jose';
import NextAuth, { type DefaultSession, type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { clearCartId, getCartId, setCartId } from '~/lib/cart';
import { serverToast } from '~/lib/server-toast';

const LoginMutation = graphql(`
  mutation LoginMutation($email: String!, $password: String!, $cartEntityId: String) {
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
      cart {
        entityId
      }
    }
  }
`);

const LoginWithTokenMutation = graphql(`
  mutation LoginWithCustomerLoginJwtMutation($jwt: String!, $cartEntityId: String) {
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
      cart {
        entityId
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
  email: z.string().email(),
  password: z.string().min(1),
});

const JwtCredentials = z.object({
  jwt: z.string(),
});

async function handleLoginCart(guestCartId?: string, loginResultCartId?: string) {
  const t = await getTranslations('Cart');

  if (guestCartId === undefined && loginResultCartId !== undefined) {
    await serverToast.info(t('cartRestored'), { position: 'top-center' });
  }

  if (loginResultCartId && guestCartId && loginResultCartId !== guestCartId) {
    await serverToast.info(t('cartCombined'), { position: 'top-center' });
  }

  if (loginResultCartId) {
    await setCartId(loginResultCartId);
  }
}

async function loginWithPassword(credentials: unknown): Promise<User | null> {
  const { email, password } = PasswordCredentials.parse(credentials);
  const cartEntityId = await getCartId();

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

  await handleLoginCart(cartEntityId, result.cart?.entityId);

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
  };
}

async function loginWithJwt(credentials: unknown): Promise<User | null> {
  const { jwt } = JwtCredentials.parse(credentials);
  const cartEntityId = await getCartId();

  const claims = decodeJwt(jwt);
  const channelId = claims.channel_id?.toString() ?? process.env.BIGCOMMERCE_CHANNEL_ID;
  const impersonatorId = claims.impersonator_id?.toString() ?? null;
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

  await handleLoginCart(cartEntityId, result.cart?.entityId);

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
  };
}

const config = {
  // Set this environment variable if you want to trust the host when using `next build` & `next start`.
  // Otherwise, this will be controlled by process.env.NODE_ENV within the library.
  trustHost: process.env.AUTH_TRUST_HOST === 'true' ? true : undefined,
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

          await clearCartId();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },
  },
  providers: [
    CredentialsProvider({
      id: 'password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: loginWithPassword,
    }),
    CredentialsProvider({
      id: 'jwt',
      credentials: {
        jwt: { label: 'JWT', type: 'text' },
      },
      authorize: loginWithJwt,
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
    impersonatorId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    customerAccessToken?: string;
  }
}
