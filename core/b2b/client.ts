import { z } from 'zod';
import { getAPIHostname } from './getApiHostname';

interface LoginWithB2BParams {
  customerId: number;
  customerAccessToken: {
    value: string;
    expiresAt: string;
  };
}

const ENV = z
  .object({
    env: z.object({
      B2B_API_TOKEN: z.string(),
      BIGCOMMERCE_CHANNEL_ID: z.string(),
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
  const { B2B_API_TOKEN, BIGCOMMERCE_CHANNEL_ID } = ENV.parse(process);

  const apiHost = getAPIHostname();

  const response = await fetch(`${apiHost}/api/io/auth/customers/storefront`, {
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

    // Use the resolved `apiHost` variable in the error message for accuracy
    throw new Error(
      `Failed to login with ${apiHost}. Status: ${response.status}, Message: ${errorMessage}`
    );
  }

  return B2BTokenResponseSchema.parse(await response.json()).data.token[0];
}
