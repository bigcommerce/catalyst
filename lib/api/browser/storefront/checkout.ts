type CheckoutUrlResponse = {
  data: {
    url: string;
  };
};

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

  const data: CheckoutUrlResponse = await response.json();
  return data.data.url;
}
