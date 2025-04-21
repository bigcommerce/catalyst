import { decodeJwt } from 'jose';
import NextAuth, { type DefaultSession, type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { clearCartId, setCartId } from '~/lib/cart';
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
      cartUnassignResult {
        cart {
          entityId
        }
      }
    }
  }
`);

const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: z.string().optional(),
});

const AnonymousCredentials = z.object({
  cartId: z.string().optional(),
});

const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: z.string().optional(),
});

const SessionUpdate = z.object({
  user: z.object({
    cartId: z.string().nullable().optional(),
  }),
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
  const { email, password, cartId } = PasswordCredentials.parse(credentials);

  const response = await client.fetch({
    document: LoginMutation,
    variables: { email, password, cartEntityId: cartId },
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

  await handleLoginCart(cartId, result.cart?.entityId);

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    cartId: result.cart?.entityId,
  };
}

async function loginWithJwt(credentials: unknown): Promise<User | null> {
  const { jwt, cartId } = JwtCredentials.parse(credentials);

  const claims = decodeJwt(jwt);
  const channelId = claims.channel_id?.toString() ?? process.env.BIGCOMMERCE_CHANNEL_ID;
  const impersonatorId = claims.impersonator_id?.toString() ?? null;
  const response = await client.fetch({
    document: LoginWithTokenMutation,
    variables: { jwt, cartEntityId: cartId },
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

  await handleLoginCart(cartId, result.cart?.entityId);

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    cartId: result.cart?.entityId,
  };
}

function loginWithAnonymous(credentials: unknown): User | null {
  const { cartId } = AnonymousCredentials.parse(credentials);

  return {
    cartId: cartId ?? null,
  };
}

const config = {
  // Explicitly setting this value to be undefined. We want the library to handle CSRF checks when taking sensitive actions.
  // When handling sensitive actions like sign in, sign out, etc., the library will automatically check for CSRF tokens.
  // If you need to implement your own sensitive actions, you will need to implement CSRF checks yourself.
  skipCSRFCheck: undefined,
  // Set this environment variable if you want to trust the host when using `next build` & `next start`.
  // Otherwise, this will be controlled by process.env.NODE_ENV within the library.
  trustHost: process.env.AUTH_TRUST_HOST === 'true' ? true : undefined,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  callbacks: {
    jwt: ({ token, user, session, trigger }) => {
      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.customerAccessToken) {
        token.user = {
          ...token.user,
          customerAccessToken: user.customerAccessToken,
        };
      }

      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.cartId) {
        token.user = {
          ...token.user,
          cartId: user.cartId,
        };
      }

      if (trigger === 'update') {
        const parsedSession = SessionUpdate.safeParse(session);

        if (parsedSession.success) {
          token.user = {
            ...token.user,
            cartId: parsedSession.data.user.cartId,
          };
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.user?.customerAccessToken) {
        session.user.customerAccessToken = token.user.customerAccessToken;
      }

      if (token.user?.cartId !== undefined) {
        session.user.cartId = token.user.cartId;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const customerAccessToken =
        'token' in message ? message.token?.user?.customerAccessToken : null;

      if (customerAccessToken) {
        try {
          const response = await client.fetch({
            document: LogoutMutation,
            variables: {},
            customerAccessToken,
            fetchOptions: {
              cache: 'no-store',
            },
          });

          const cartId = response.data.logout.cartUnassignResult.cart?.entityId;

          if (cartId) {
            await setCartId(cartId);
          } else {
            await clearCartId();
          }
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
        cartId: { type: 'text' },
      },
      authorize: loginWithPassword,
    }),
    CredentialsProvider({
      id: 'anonymous',
      credentials: {
        cartId: { type: 'text' },
      },
      authorize: loginWithAnonymous,
    }),
    CredentialsProvider({
      id: 'jwt',
      credentials: {
        jwt: { type: 'text' },
        cartId: { type: 'text' },
      },
      authorize: loginWithJwt,
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth(config);

export const getSessionCustomerAccessToken = async () => {
  try {
    const session = await auth();

    return session?.user?.customerAccessToken;
  } catch {
    // No empty
  }
};

export const isLoggedIn = async () => {
  const cat = await getSessionCustomerAccessToken();

  return Boolean(cat);
};

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'];
  }

  interface User {
    name?: string | null;
    email?: string | null;
    cartId?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    user?: DefaultSession['user'];
  }
}
