import { decodeJwt } from 'jose';
import NextAuth, { type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { anonymousSignIn, clearAnonymousSession } from '~/auth/anonymous-session';
import { loginWithB2B } from '~/b2b/client';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { clearCartId, setCartId } from '~/lib/cart';
import { serverToast } from '~/lib/server-toast';

const LoginMutation = graphql(`
  mutation LoginMutation($email: String!, $password: String!, $cartEntityId: String) {
    login(email: $email, password: $password, guestCartEntityId: $cartEntityId) {
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
        expiresAt
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
  mutation LogoutMutation($cartEntityId: String) {
    logout(cartEntityId: $cartEntityId) {
      result
      cartUnassignResult {
        cart {
          entityId
        }
      }
    }
  }
`);

const cartIdSchema = z
  .string()
  .uuid()
  .or(z.literal('undefined')) // auth.js seems to pass the cart id as a string literal 'undefined' when not set.
  .optional()
  .transform((val) => (val === 'undefined' ? undefined : val));

const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: cartIdSchema,
});

const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: cartIdSchema,
});

const SessionUpdate = z.object({
  user: z.object({
    cartId: cartIdSchema,
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

  const b2bToken = await loginWithB2B({
    customerId: result.customer.entityId,
    customerAccessToken: result.customerAccessToken,
  });

  await clearAnonymousSession();

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    cartId: result.cart?.entityId,
    b2bToken,
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

  const b2bToken = await loginWithB2B({
    customerId: result.customer.entityId,
    customerAccessToken: result.customerAccessToken,
  });

  await clearAnonymousSession();

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    cartId: result.cart?.entityId,
    b2bToken,
  };
}

const partitionedCookie = (name?: string) =>
  ({
    ...(name !== undefined ? { name } : {}),
    options: {
      partitioned: true,
      secure: true,
      sameSite: 'none',
    },
  }) as const;

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
      if (user?.b2bToken) {
        token.b2bToken = user.b2bToken;
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

      if (token.b2bToken) {
        session.b2bToken = token.b2bToken;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const cartEntityId = 'token' in message ? message.token?.user?.cartId : null;
      const customerAccessToken =
        'token' in message ? message.token?.user?.customerAccessToken : null;

      if (customerAccessToken) {
        try {
          const logoutResponse = await client.fetch({
            document: LogoutMutation,
            variables: {
              cartEntityId,
            },
            customerAccessToken,
            fetchOptions: {
              cache: 'no-store',
            },
          });

          // If the logout is successful, we want to establish a new anonymous session.
          // This will allow us to restore the cart if persistent cart is disabled.
          await anonymousSignIn();

          // If persistent cart is disabled, we can restore the cart back to the anonymous session.
          if (logoutResponse.data.logout.cartUnassignResult.cart) {
            await setCartId(logoutResponse.data.logout.cartUnassignResult.cart.entityId);

            return;
          }

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
        cartId: { type: 'text' },
      },
      authorize: loginWithPassword,
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
  // configure NextAuth cookies to work inside of the Makeswift Builder's canvas
  cookies: {
    sessionToken: partitionedCookie(),
    callbackUrl: partitionedCookie(),
    csrfToken: partitionedCookie(),
    pkceCodeVerifier: partitionedCookie(),
    state: partitionedCookie(),
    nonce: partitionedCookie(),
    webauthnChallenge: partitionedCookie(),
  },
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

export {
  anonymousSignIn,
  clearAnonymousSession,
  getAnonymousSession,
  updateAnonymousSession,
} from './anonymous-session';
