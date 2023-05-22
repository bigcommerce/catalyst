import { clientConfig } from '../config';

interface StorefrontTokenResponse {
  data?: {
    cart_url: string;
    checkout_url: string;
    embedded_checkout_url: string;
  };
  status: number;
}

export const createCartRedirectUrl = async (cartId: string): Promise<StorefrontTokenResponse> => {
  const { apiUrl, storeHash, accessToken } = clientConfig;

  const response = await fetch(`${apiUrl}/stores/${storeHash}/v3/carts/${cartId}/redirect_urls`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': accessToken,
    },
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const data = (await response.json()) as StorefrontTokenResponse;

  return data;
};
