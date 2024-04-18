'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSessionCustomerId } from '~/auth';
import { getCheckoutUrl } from '~/client/management/get-checkout-url';

export async function redirectToCheckout() {
  const cartId = cookies().get('cartId')?.value;
  const customerId = await getSessionCustomerId();

  if (!cartId) {
    redirect('/cart');
  }

  const checkoutUrl = await getCheckoutUrl(cartId, customerId);

  redirect(checkoutUrl);
}
