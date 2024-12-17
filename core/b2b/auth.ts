import { client } from '../client';

export interface B2BUser {
  id: string;
  name: string;
  email: string;
  customerAccessToken: string;
  expiresAt: string;
  b2bToken?: string;
}

interface StorefrontTokenResponse {
  data: {
    token: string[];
  };
}

export interface CustomerAccessToken {
  value: string;
  expiresAt: string;
}

export const getB2BToken = async (
  customerId: number,
  customerAccessToken: CustomerAccessToken,
): Promise<string | undefined> => {
  if (!process.env.B2B_API_HOST || !process.env.B2B_API_TOKEN) {
    return undefined;
  }

  try {
    const payload = {
      channelId: Number(process.env.BIGCOMMERCE_CHANNEL_ID),
      customerId,
      customerAccessToken,
    };

    const response = await client.b2bFetch<StorefrontTokenResponse>(
      '/api/io/auth/customers/storefront',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data?.token?.[0];
  } catch (error) {
    console.error('Error fetching B2B token:', error);

    return undefined;
  }
};

export const enrichUserWithB2B = async (user: B2BUser): Promise<B2BUser> => {
  const b2bToken = await getB2BToken(parseInt(user.id), {
    value: user.customerAccessToken,
    expiresAt: user.expiresAt,
  });

  if (b2bToken) {
    return { ...user, b2bToken };
  }

  return user;
};

// B2B Types
export type B2BEvent = string;

export interface CallbackEvent {
  data: unknown;
  preventDefault: () => void;
}

export type Callback = (event: CallbackEvent) => unknown;

export interface CallbackManagerType {
  callbacks: Map<B2BEvent, Callback[]>;
  addEventListener(callbackKey: B2BEvent, callback: Callback): void;
  removeEventListener(callbackKey: B2BEvent, callback: Callback): boolean;
  dispatchEvent(callbackKey: B2BEvent, data?: unknown): boolean;
}

declare global {
  interface Window {
    b2b: {
      callbacks: CallbackManagerType;
      utils: {
        getRoutes: () => unknown[];
        openPage: (path: string, url?: string) => void;
        user: {
          getProfile: () => { role: number };
          loginWithB2BStorefrontToken: (b2bStorefrontJWTToken: string) => Promise<void>;
          logout: (params?: { handleError?: (error: unknown) => unknown }) => Promise<void>;
          getB2BToken: () => string;
        };
      };
    };
  }
}

declare module 'next-auth' {
  interface Session {
    b2bToken?: string;
  }

  interface User {
    b2bToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    b2bToken?: string;
  }
}
