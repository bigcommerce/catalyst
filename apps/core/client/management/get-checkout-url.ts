import * as jose from 'jose';
import { z } from 'zod';

import { client } from '..';

const clientSecret = process.env.BIGCOMMERCE_CLIENT_SECRET;
const clientId = process.env.BIGCOMMERCE_CLIENT_ID;
const channelId = process.env.BIGCOMMERCE_CHANNEL_ID ?? Number(process.env.BIGCOMMERCE_CHANNEL_ID);
const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

const RedirectUrlsSchema = z.object({
  data: z.object({
    checkout_url: z.string().min(1),
    embedded_checkout_url: z.string(),
    cart_url: z.string(),
  }),
});

/*
 * Use the Customer Login API to ensure the customer is logged into the hosted checkout during the checkout redirect
 * process. This is a temporary solution to support logged-in customer checkout until the GraphQL API supports this redirect functionality.
 *
 * https://developer.bigcommerce.com/docs/store-operations/customers#customer-login-api
 *
 * @param checkoutUrl - The checkout URL to redirect to, from V3 Cart API
 * @param customerId - The customer ID to log in as, from the session
 * @returns The Customer Login API URL, with the redirect URL encoded in the JWT
 */
const wrapInCustomerLoginJwt = async (checkoutUrl: string, customerId: number) => {
  if (!clientSecret || !clientId) {
    // eslint-disable-next-line no-console
    console.error(
      'Missing BIGCOMMERCE_CLIENT_SECRET and/or BIGCOMMERCE_CLIENT_ID, unable to redirect to checkout while preserving login state',
    );

    return checkoutUrl;
  }

  const urlObj = new URL(checkoutUrl);
  const origin = urlObj.origin;
  const relativeUrl = urlObj.pathname + urlObj.search;

  const secret = new TextEncoder().encode(clientSecret);
  const alg = 'HS256';

  const jwt = await new jose.SignJWT({
    operation: 'customer_login',
    store_hash: storeHash,
    customer_id: customerId,
    channel_id: channelId,
    jti: crypto.randomUUID(),
    redirect_to: relativeUrl,
  })
    .setProtectedHeader({ alg, typ: 'JWT' })
    .setIssuer(clientId)
    // accommodate minor clock skew, ensures the token is not created
    // in the future from the BigCommerce server's perspective
    .setIssuedAt(Date.now() / 1000 - 5)
    .setExpirationTime('24h')
    .sign(secret);

  return `${origin}/login/token/${jwt}`;
};

// Url used to redirect the user to the checkout page
export const getCheckoutUrl = async (cartId: string, customerId?: number) => {
  const response = await client.fetchCartRedirectUrls(cartId);
  const parsedResponse = RedirectUrlsSchema.safeParse(response);

  if (parsedResponse.success) {
    const checkoutUrl = parsedResponse.data.data.checkout_url;

    if (customerId) {
      return wrapInCustomerLoginJwt(checkoutUrl, customerId);
    }

    return checkoutUrl;
  }

  throw new Error('Unable to get checkout URL: Invalid response');
};
