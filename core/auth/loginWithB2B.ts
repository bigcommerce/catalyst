import { ResultOf } from 'gql.tada';
import { z } from 'zod';
import { LoginMutation } from '.';

export interface LoginWithB2BParams {
  customer: NonNullable<ResultOf<typeof LoginMutation>['login']['customer']>;
  customerAccessToken: NonNullable<ResultOf<typeof LoginMutation>['login']['customerAccessToken']>;
}

export async function loginWithB2B({ customer, customerAccessToken }: LoginWithB2BParams) {
  if (!process.env.B2B_API_TOKEN) {
    throw new Error('Environment variable B2B_API_TOKEN is not set');
  }

  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  const payload = {
    channelId,
    customerId: customer.entityId,
    customerAccessToken,
  };

  const response = await fetch(`https://api-b2b.bigcommerce.com/api/io/auth/customers/storefront`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authToken: process.env.B2B_API_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const B2BTokenResponseSchema = z.object({
    data: z.object({
      token: z.array(z.string()),
    }),
  });

  const [token] = B2BTokenResponseSchema.parse(await response.json()).data.token;

  if (!token) {
    throw new Error('No token returned from B2B API');
  }

  return token;
}
