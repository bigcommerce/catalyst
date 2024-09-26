'use server';

import { cookies } from 'next/headers';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';

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

// TODO: return error status?
export const redirectToCheckout = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    throw new Error('No cartId cookie found');
  }

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: CheckoutRedirectMutation,
    variables: { cartId },
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const url = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;

  if (!url) {
    throw new Error('Invalid checkout url.');
  }

  redirect(url);
};
