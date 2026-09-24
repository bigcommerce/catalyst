import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import NextAuth, { type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getTranslations } from 'next-intl/server';
import { AsyncLocalStorage } from 'node:async_hooks';
import { z } from 'zod';

import {
  anonymousSignIn,
  clearAnonymousSession,
  getAnonymousSession,
} from '~/auth/anonymous-session';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getSessionTokenCookieOptions } from '~/lib/auth/session-token-cookie-options';
import { clearCartId, setCartId } from '~/lib/cart';
import { cartIdForLogout, cartsAfterLogin } from '~/lib/cart/channel-cart';
import { getCurrentChannelId } from '~/lib/channel';
import { serverToast } from '~/lib/server-toast';

// The logout route knows the channel, but the Auth.js sign-out event does not receive it.
const logoutChannelId = new AsyncLocalStorage<string | undefined>();

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
  .nullish()
  .transform((val) => (val == null || val === 'undefined' ? undefined : val));

const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: cartIdSchema,
  channelId: z.string().min(1).optional(),
});

const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: cartIdSchema,
});

const cartIdsSchema = z.record(z.string().min(1), z.string().uuid()).nullable();

const SessionUpdate = z.object({
  user: z.object({
    cartId: cartIdSchema,
    cartIds: cartIdsSchema.optional(),
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
}

/**
 * Copies the guest cart map onto the customer. `clearAnonymousSession` runs next and would drop
 * any write made here. The cart BigCommerce returns replaces only `channelId`.
 *
 * @param {string} [channelId] - Channel the shopper is logging in on.
 * @param {string} [loginResultCartId] - Cart id returned by the login mutation.
 * @returns {Promise<object>} Cart fields for the customer session.
 */
async function cartForLoggedInUser(channelId: string | undefined, loginResultCartId?: string) {
  const anonymousSession = await getAnonymousSession();

  return cartsAfterLogin(
    {
      cartId: anonymousSession?.user?.cartId,
      cartIds: anonymousSession?.user?.cartIds,
    },
    channelId,
    loginResultCartId,
  );
}

async function loginWithPassword(credentials: unknown): Promise<User | null> {
  const {
    email,
    password,
    cartId,
    channelId: providedChannelId,
  } = PasswordCredentials.parse(credentials);
  const channelId = providedChannelId ?? (await getCurrentChannelId());

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

  const cart = await cartForLoggedInUser(channelId, result.cart?.entityId);

  await handleLoginCart(cartId, result.cart?.entityId);
  await clearAnonymousSession();

  return {
    firstName: result.customer.firstName,
    lastName: result.customer.lastName,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    cartId: cart.cartId,
    cartIds: cart.cartIds,
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

  const cart = await cartForLoggedInUser(channelId, result.cart?.entityId);

  await handleLoginCart(cartId, result.cart?.entityId);
  await clearAnonymousSession();

  return {
    firstName: result.customer.firstName,
    lastName: result.customer.lastName,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    cartId: cart.cartId,
    cartIds: cart.cartIds,
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
  cookies: {},
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

      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.cartIds !== undefined) {
        token.user = {
          ...token.user,
          cartId: user.cartId ?? null,
          cartIds: user.cartIds,
        };
      }

      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.firstName !== undefined) {
        token.user = {
          ...token.user,
          firstName: user.firstName,
        };
      }

      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.lastName !== undefined) {
        token.user = {
          ...token.user,
          lastName: user.lastName,
        };
      }

      if (trigger === 'update') {
        const parsedSession = SessionUpdate.safeParse(session);

        if (parsedSession.success) {
          token.user = {
            ...token.user,
            cartId: parsedSession.data.user.cartId,
            // Absent `cartIds` must not wipe a map already stored in the token.
            ...(parsedSession.data.user.cartIds !== undefined
              ? { cartIds: parsedSession.data.user.cartIds }
              : {}),
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

      if (token.user?.cartIds !== undefined) {
        session.user.cartIds = token.user.cartIds;
      }

      if (token.user?.firstName !== undefined) {
        session.user.firstName = token.user.firstName;
      }

      if (token.user?.lastName !== undefined) {
        session.user.lastName = token.user.lastName;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const user = 'token' in message ? message.token?.user : undefined;
      const channelId = logoutChannelId.getStore() ?? (await getCurrentChannelId());
      const cartEntityId = cartIdForLogout(
        { cartId: user?.cartId, cartIds: user?.cartIds },
        channelId,
      );
      const customerAccessToken = user?.customerAccessToken;

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
            await setCartId(logoutResponse.data.logout.cartUnassignResult.cart.entityId, channelId);

            return;
          }

          await clearCartId(channelId);
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
        channelId: { type: 'text' },
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
} satisfies NextAuthConfig;

const SESSION_TOKEN_NAME_RE = /^(__Secure-)?authjs\.session-token(\.\d+)?$/;

// Auth.js sets Expires on session token cookies via cookies().set() when signIn/updateSession
// are called from server actions. Re-set those cookies without Expires so they comply with
// Essential classification (session cookies that expire when the browser closes).
async function patchSessionTokenCookies() {
  const cookieJar = await cookies();

  cookieJar.getAll().forEach(({ name, value }) => {
    if (SESSION_TOKEN_NAME_RE.test(name) && value) {
      cookieJar.set(name, value, getSessionTokenCookieOptions(name, config));
    }
  });
}

const {
  handlers,
  auth,
  signIn: authSignIn,
  signOut: authSignOut,
  unstable_update: authUpdateSession,
} = NextAuth(config);

export { handlers, auth };

type SignOutOptions = NonNullable<Parameters<typeof authSignOut>[0]> & {
  /** Channel the shopper is leaving. Logout sends that channel's cart to BigCommerce. */
  channelId?: string;
};

export const signOut = async (options?: SignOutOptions) => {
  const { channelId, ...authOptions } = options ?? {};

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return logoutChannelId.run(channelId, () => authSignOut(authOptions));
};

export const signIn = async (...args: Parameters<typeof authSignIn>) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await authSignIn(...args);
  } finally {
    await patchSessionTokenCookies();
  }
};

export const updateSession = async (...args: Parameters<typeof authUpdateSession>) => {
  try {
    return await authUpdateSession(...args);
  } finally {
    await patchSessionTokenCookies();
  }
};

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
