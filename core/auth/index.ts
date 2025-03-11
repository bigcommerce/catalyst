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
  type: z.literal('password'),
  email: z.string().email(),
  password: z.string().min(1),
});

const JwtCredentials = z.object({
  type: z.literal('jwt'),
  jwt: z.string(),
});

export const Credentials = z.discriminatedUnion('type', [PasswordCredentials, JwtCredentials]);

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

async function loginWithPassword(
  email: string,
  password: string,
  cartEntityId?: string,
): Promise<User | null> {
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

async function loginWithJwt(jwt: string, cartEntityId?: string): Promise<User | null> {
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

async function authorize(credentials: unknown): Promise<User | null> {
  const parsed = Credentials.parse(credentials);
  const cartEntityId = await getCartId();

  switch (parsed.type) {
    case 'password': {
      const { email, password } = parsed;

      return loginWithPassword(email, password, cartEntityId);
    }

    case 'jwt': {
      const { jwt } = parsed;

      return loginWithJwt(jwt, cartEntityId);
    }

    default:
      return null;
  }
}

const config = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
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
      credentials: {
        type: { type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        jwt: { type: 'text' },
      },
      authorize,
    }),
  ],
} satisfies NextAuthConfig;

const { handlers, auth, signIn: nextAuthSignIn, signOut } = NextAuth(config);

const signIn = (
  credentials: z.infer<typeof Credentials>,
  options: { redirect?: boolean | undefined; redirectTo?: string },
) => nextAuthSignIn('credentials', { ...credentials, ...options });

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
