import { decodeJwt } from 'jose';
import { type NextAuthConfig, type Session, type User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getLoginMutations } from './graphql';
import {
  JwtCredentials,
  LoginWithPasswordResponse,
  LoginWithTokenResponse,
  PasswordCredentials,
  SessionUpdate,
} from './schemas';
import { BigCommerceAuthConfig, Client, GraphQL } from './types';

/**
 * @note there is a lot of authentication-related code in `core/app/[locale]/(default)/(auth)/`,
 *       (e.g., server actions), however this code is tightly coupled with Catalyst application
 *       code, (e.g., conform-to, data transformers, etc.), so it makes sense to keep it outside
 *       the scope of this package.
 */

async function loginWithPassword(
  client: Client,
  graphql: GraphQL,
  credentials: unknown,
): Promise<User | null> {
  const { email, password, cartId } = PasswordCredentials.parse(credentials);
  /**
   * @todo do we need to account for a use case in which developers want to add additional
   *       fields to the customer object returned by the login mutation? This might be best
   *       determined by asking the community for use cases in which this is needed, if there
   *       are any.
   */
  const { LoginMutation } = getLoginMutations(graphql);

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

  /**
   * @todo we probably need a better way of typing the response, one idea is to make the GraphQL
   *       introspection (e.g., `bigcommerce-graphql.d.ts`) a part of the BigCommerceAuthConfig
   */
  const result = LoginWithPasswordResponse.parse(response.data).login;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  /**
   * @note `cartTransitionResult` on the JWT is a transient property that the client can use to
   *       display a one-time notice (e.g., a toast) to the user. The client should clear the
   *       property after it has been acknowledged (e.g., by calling `useSession().update`)
   */
  let cartTransitionResult: 'cartRestored' | 'cartCombined' | null = null;

  if (cartId === undefined && result.cart?.entityId !== undefined) {
    cartTransitionResult = 'cartRestored';
  }

  if (cartId && result.cart?.entityId && cartId !== result.cart.entityId) {
    cartTransitionResult = 'cartCombined';
  }

  /**
   * @note in `core/auth/index.ts`, `handleLoginCart` calls `setCartId`, which is dependent on
   *       `unstable_update` returned by NextAuth(config). This creates an awkward circular
   *       dependency and is actually redundant because the cart ID is already set on the user
   *       object below, and appended to the JWT in the `defaultJwtCallback` function.
   *       TL;DR: we don't need to call `setCartId` inside `loginWith[Password|Jwt]`
   */

  /**
   * @todo incorporate `loginWithB2B`, which is dependent on:
   *       - `customerId` ✅
   *       - `customerAccessToken` ✅
   *       - `process.env.B2B_API_TOKEN`
   *       - `process.env.B2B_API_HOST`
   *       - `process.env.BIGCOMMERCE_CHANNEL_ID`
   *       - `process.env.NODE_ENV`
   *       - B2B Edition also has a `login` server action, but since it's very tightly coupled
   *         with Catalyst application code, similar to our `login` server action on `canary`,
   *         we'll keep it outside the scope of this package.
   */

  /**
   * @todo PRESSURE TEST EXAMPLE: integrate GitHub provider (may involve REST Management API)
   * @todo PRESSURE TEST EXAMPLE: switch to database session strategy and see what changes
   */

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    cartId: result.cart?.entityId,
    cartTransitionResult,
  };
}

async function loginWithJwt(
  client: Client,
  graphql: GraphQL,
  credentials: unknown,
): Promise<User | null> {
  const { jwt, cartId } = JwtCredentials.parse(credentials);
  const { LoginWithTokenMutation } = getLoginMutations(graphql);

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

  const result = LoginWithTokenResponse.parse(response.data).loginWithCustomerLoginJwt;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  let cartTransitionResult: 'cartRestored' | 'cartCombined' | null = null;

  if (cartId === undefined && result.cart?.entityId !== undefined) {
    cartTransitionResult = 'cartRestored';
  }

  if (cartId && result.cart?.entityId && cartId !== result.cart.entityId) {
    cartTransitionResult = 'cartCombined';
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    cartId: result.cart?.entityId,
    cartTransitionResult,
  };
}

function defaultJwtCallback({
  token,
  user,
  session,
  trigger,
}: {
  token: JWT;
  user: User;
  session: Session;
  trigger: 'signIn' | 'signUp' | 'update';
}) {
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
}

const partitionedCookie = (name?: string) =>
  ({
    ...(name !== undefined ? { name } : {}),
    options: {
      /**
       * @todo this is missing `httpOnly`, `path`, and sometimes `maxAge`. It also changes
       *       `sameSite` from `lax` to `none`, and secure to always `true` (instead of
       *       `useSecureCookies`). Need to figure out the implications of these changes.
       */
      partitioned: true,
      secure: true,
      sameSite: 'none',
    },
  }) as const;

export function BigCommerceAuthConfig({
  client,
  graphql,
  userConfig,
}: BigCommerceAuthConfig): NextAuthConfig {
  const {
    providers: userProviders,
    session: userSession,
    callbacks: userCallbacks,
    ...restUserConfig
  } = userConfig;

  const { jwt: userJwtCallback, ...restUserCallbacks } = userCallbacks ?? {};

  const jwtCallback = userJwtCallback ?? defaultJwtCallback;

  const providers = [
    CredentialsProvider({
      id: 'password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: (credentials: unknown) => loginWithPassword(client, graphql, credentials),
    }),
    CredentialsProvider({
      id: 'jwt',
      credentials: {
        jwt: { type: 'text' },
      },
      authorize: (credentials: unknown) => loginWithJwt(client, graphql, credentials),
    }),
    ...userProviders,
  ];

  const config: NextAuthConfig = {
    providers,
    callbacks: {
      // @ts-expect-error - @todo fix this
      jwt: userSession?.strategy === 'jwt' ? jwtCallback : undefined,
      ...restUserCallbacks,
    },
    session: {
      ...userSession,
    },
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
    ...restUserConfig,
  };

  return config;
}
