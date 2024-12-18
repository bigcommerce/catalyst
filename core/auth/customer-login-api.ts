import { randomUUID } from 'crypto';
import { SignJWT } from 'jose';

/**
 * Build a Customer Login API JWT which can be used in auth/index.ts to log in a customer
 * using the LoginWithTokenMutation, or used as a redirect to /login/token/[token]
 *
 * This is a stub intended to be used when implementing 3rd party authentication callbacks
 *
 * Requires that BIGCOMMERCE_CLIENT_SECRET and BIGCOMMERCE_CLIENT_ID are set in the environment
 * from a client that has the Customer Login scope enabled
 *
 * @param {number} customerId - The BigCommerce customer ID to generate the login token for
 * @param {number} [channelId] - Channel ID that the customer will be logged into
 * @param {string} [redirectTo] - Relative URL to redirect to after successful login
 * @param {Record<string, any>} [additionalClaims] - Optional additional claims to include in the JWT
 * @returns {Promise<string>} A JWT token that can be used to authenticate the customer
 * @throws {Error} If BIGCOMMERCE_CLIENT_SECRET is not set in environment variables
 * @throws {Error} If BIGCOMMERCE_CLIENT_ID is not set in environment variables
 */
export const generateCustomerLoginApiJwt = async (
  customerId: number,
  channelId: number,
  redirectTo: string = '/account/orders',
  additionalClaims?: Record<string, any>,
): Promise<string> => {
  const clientId = process.env.BIGCOMMERCE_CLIENT_ID;
  const clientSecret = process.env.BIGCOMMERCE_CLIENT_SECRET;
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!clientSecret) {
    throw new Error('BIGCOMMERCE_CLIENT_SECRET is not set in environment variables');
  }

  if (!clientId) {
    throw new Error('BIGCOMMERCE_CLIENT_ID is not set in environment variables');
  }

  if (!storeHash) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set in environment variables');
  }

  const payload = {
    iss: clientId,
    iat: Math.floor(Date.now() / 1000),
    jti: randomUUID(),
    operation: 'customer_login',
    store_hash: storeHash,
    customer_id: Math.floor(customerId),
    ...(channelId && { channel_id: channelId }),
    ...(redirectTo && { redirect_to: redirectTo }),
    ...(additionalClaims || {}),
  };

  // Convert client secret to Uint8Array for jose library
  const secretKey = new TextEncoder().encode(clientSecret);

  // Create and sign the JWT
  return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).sign(secretKey);
};
