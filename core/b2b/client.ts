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
    env: z.union([
      z.object({
        BIGCOMMERCE_CHANNEL_ID: z.string(),
        B2B_API_TOKEN: z.string(),
      }),
      z.object({
        BIGCOMMERCE_CHANNEL_ID: z.string(),
        BIGCOMMERCE_STORE_HASH: z.string(),
        BIGCOMMERCE_ACCESS_TOKEN: z.string(),
      }),
    ]),
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
  const env = ENV.parse(process);
  const BIGCOMMERCE_CHANNEL_ID = env.BIGCOMMERCE_CHANNEL_ID;
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if ('BIGCOMMERCE_ACCESS_TOKEN' in env) {
    headers['X-Auth-Token'] = env.BIGCOMMERCE_ACCESS_TOKEN;
    headers['X-Store-Hash'] = env.BIGCOMMERCE_STORE_HASH;
  } else if ('B2B_API_TOKEN' in env) {
    headers['authToken'] = env.B2B_API_TOKEN;
    console.warn('This is deprecated in favour or BIGCOMMERCE_ACCESS_TOKEN, read https://support.bigcommerce.com/s/article/Store-API-Accounts?language=en_US')
  } else {
    throw new Error('No B2B API token or BigCommerce token found in environment variables.');
  } 

  const apiHost = getAPIHostname();
  const response = await fetch(`${apiHost}/api/io/auth/customers/storefront`, {
    method: 'POST',
    headers,
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
