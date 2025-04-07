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

const ENV = z
  .object({
    env: z.object({
      B2B_API_TOKEN: z.string(),
      BIGCOMMERCE_CHANNEL_ID: z.string(),
      B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com'),
    }),
  })
  .transform(({ env }) => env);

const ErrorResponse = z.object({
  detail: z.string().default('Unknown error'),
});

const B2BTokenResponseSchema = z.object({
  data: z.object({
    token: z.array(z.string()).nonempty({ message: 'No token returned from B2B API' }),
  }),
});

export async function loginWithB2B({ customerId, customerAccessToken }: LoginWithB2BParams) {
  const { B2B_API_HOST, B2B_API_TOKEN, BIGCOMMERCE_CHANNEL_ID } = ENV.parse(process);

  const response = await fetch(`${B2B_API_HOST}/api/io/auth/customers/storefront`, {
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
  });

  if (!response.ok) {
    const errorMessage = ErrorResponse.parse(await response.json()).detail;

    throw new Error(
      `Failed to login with ${B2B_API_HOST}. Status: ${response.status}, Message: ${errorMessage}`,
    );
  }

  return B2BTokenResponseSchema.parse(await response.json()).data.token[0];
}
