import { z } from 'zod';

interface LoginWithB2BParams {
  customerId: number;
  customerAccessToken: {
    value: string;
    expiresAt: string;
  };
}

const EnvironmentSchema = z.object({
  B2B_API_TOKEN: z.string({ message: 'B2B_API_TOKEN is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
});

const B2BTokenResponseSchema = z.object({
  data: z.object({
    token: z.array(z.string()),
  }),
});

export async function loginWithB2B({ customerId, customerAccessToken }: LoginWithB2BParams) {
  const { BIGCOMMERCE_CHANNEL_ID, B2B_API_TOKEN } = EnvironmentSchema.parse(process.env);

  const response = await fetch(
    `${process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com'}/api/io/auth/customers/storefront`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: B2B_API_TOKEN,
      },
      body: JSON.stringify({
        channelId: BIGCOMMERCE_CHANNEL_ID,
        customerId,
        customerAccessToken,
      }),
    },
  );

  const token = B2BTokenResponseSchema.parse(await response.json()).data.token[0];

  if (!token) {
    throw new Error('No token returned from B2B API');
  }

  return token;
}
