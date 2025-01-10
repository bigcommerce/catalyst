import { z } from 'zod';

export interface B2BUser {
  id: string;
  name: string;
  email: string;
  customerAccessToken: string;
  expiresAt: string;
  b2bToken?: string;
}

export interface CustomerAccessToken {
  value: string;
  expiresAt: string;
}

export const getB2BToken = async (
  customerId: number,
  customerAccessToken: CustomerAccessToken,
): Promise<string | undefined> => {
  if (!process.env.B2B_API_TOKEN) {
    // eslint-disable-next-line no-console
    console.warn('[B2B] B2B_API_TOKEN is not set, unable to fetch B2B token');

    return undefined;
  }

  try {
    const payload = {
      channelId: Number(process.env.BIGCOMMERCE_CHANNEL_ID),
      customerId,
      customerAccessToken,
    };

    const response = await fetch(
      `https://api-b2b.bigcommerce.com/api/io/auth/customers/storefront`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          authToken: process.env.B2B_API_TOKEN || '',
        },
        body: JSON.stringify(payload),
      },
    );

    const B2BTokenResponseSchema = z.object({
      data: z.object({
        token: z.array(z.string()),
      }),
    });

    const responseData = B2BTokenResponseSchema.parse(await response.json());

    return responseData.data.token[0];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching B2B token:', error);

    return undefined;
  }
};

export const enrichUserWithB2B = async (user: B2BUser): Promise<B2BUser> => {
  const b2bToken = await getB2BToken(parseInt(user.id, 10), {
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
    b2b?: {
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
        quote?: { addProducts?: (products: unknown) => void };
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
