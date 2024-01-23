import { z } from 'zod';

import { client } from '..';

const RedirectUrlsSchema = z.object({
  data: z.object({
    checkout_url: z.string().min(1),
    embedded_checkout_url: z.string(),
    cart_url: z.string(),
  }),
});

// Url used to redirect the user to the checkout page
export const getCheckoutUrl = async (cartId: string) => {
  const response = await client.fetchCartRedirectUrls(cartId);
  const parsedResponse = RedirectUrlsSchema.safeParse(response);

  if (parsedResponse.success) {
    return parsedResponse.data.data.checkout_url;
  }

  throw new Error('Unable to get checkout URL: Invalid response');
};
