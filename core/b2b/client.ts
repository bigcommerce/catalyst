import { z } from 'zod';

interface LoginWithB2BParams {
  customerId: number;
  customerAccessToken: {
    value: string;
    expiresAt: string;
  };
}

type ENV_VARIABLES = 'B2B_API_TOKEN' | 'BIGCOMMERCE_CHANNEL_ID';

const getEnv = (key: ENV_VARIABLES) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return process.env[key];
};

export async function loginWithB2B({ customerId, customerAccessToken }: LoginWithB2BParams) {
  const channelId = getEnv('BIGCOMMERCE_CHANNEL_ID');

  const payload = {
    channelId,
    customerId,
    customerAccessToken,
  };

  const response = await fetch(
    `${process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com'}/api/io/auth/customers/storefront`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: getEnv('B2B_API_TOKEN'),
      },
      body: JSON.stringify(payload),
    },
  );

  const B2BTokenResponseSchema = z.object({
    data: z.object({
      token: z.array(z.string()),
    }),
  });

  const {
    data: { token },
  } = B2BTokenResponseSchema.parse(await response.json());

  if (!token[0]) {
    throw new Error('No token returned from B2B API');
  }

  return token[0];
}
