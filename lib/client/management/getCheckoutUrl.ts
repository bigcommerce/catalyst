const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
const xAuthToken = process.env.BIGCOMMERCE_X_AUTH_TOKEN ?? '';

interface RedirectUrlsResponse {
  data: {
    checkout_url: string;
  };
}

const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return typeof obj === 'object' && obj !== null;
};

const isRedirectUrlsResponse = (resp: unknown): resp is RedirectUrlsResponse => {
  if (!isObject(resp)) {
    return false;
  }

  if (!isObject(resp.data)) {
    return false;
  }

  if (typeof resp.data.checkout_url !== 'string') {
    return false;
  }

  return true;
};

// Url used to redirect the user to the checkout page
export const getCheckoutUrl = async (cartId: string) => {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartId}/redirect_urls`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': xAuthToken,
      },
      cache: 'no-store',
      body: JSON.stringify({
        cart_id: cartId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to get checkout URL: ${response.statusText}`);
  }

  const resp: unknown = await response.json();

  if (isRedirectUrlsResponse(resp)) {
    return resp.data.checkout_url;
  }

  throw new Error('Unable to get checkout URL: Invalid response');
};
