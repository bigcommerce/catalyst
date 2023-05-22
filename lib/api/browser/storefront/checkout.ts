interface CheckoutUrlResponse {
  data: {
    url: string;
  };
}

export default async function getCheckoutUrl(cartId: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error(
      'getBrowserClient is only for use in the browser. Use getServerClient for server requests.',
    );
  }

  const response = await fetch(`/api/checkout/${cartId}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    credentials: 'same-origin',
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const data = (await response.json()) as CheckoutUrlResponse;

  return data.data.url;
}
