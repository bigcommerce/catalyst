'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const CheckoutRedirectMutation = graphql(`
  mutation CheckoutRedirectMutation($cartId: String!) {
    cart {
      createCartRedirectUrls(input: { cartEntityId: $cartId }) {
        redirectUrls {
          redirectedCheckoutUrl
        }
      }
    }
  }
`);

export const redirectToCheckout = async (formData: FormData) => {
  const cartId = z.string().parse(formData.get('cartId'));

  const { data } = await client.fetch({
    document: CheckoutRedirectMutation,
    variables: { cartId },
    fetchOptions: { cache: 'no-store' },
  });

  const url = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;

  if (!url) {
    throw new Error('Invalid checkout url.');
  }

  redirect(url);
};
