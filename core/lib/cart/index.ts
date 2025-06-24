'use server';

import { unstable_expireTag } from 'next/cache';

import { auth, getAnonymousSession, updateAnonymousSession, updateSession } from '~/auth';
import { TAGS } from '~/client/tags';
import { addCartLineItem, AddCartLineItemsInput } from '~/lib/cart/add-cart-line-item';
import { createCart, CreateCartInput } from '~/lib/cart/create-cart';
import { validateCartId } from '~/lib/cart/validate-cart';

import { MissingCartError } from './error';

export async function getCartId(): Promise<string | undefined> {
  const anonymousSession = await getAnonymousSession();

  if (anonymousSession) {
    return anonymousSession.user?.cartId ?? undefined;
  }

  const session = await auth();

  return session?.user?.cartId ?? undefined;
}

export async function setCartId(cartId: string): Promise<void> {
  const anonymousSession = await getAnonymousSession();

  if (anonymousSession) {
    await updateAnonymousSession({ cartId });

    return;
  }

  await updateSession({ user: { cartId } });
}

export async function clearCartId(): Promise<void> {
  const anonymousSession = await getAnonymousSession();

  if (anonymousSession) {
    await updateAnonymousSession({ cartId: null });

    return;
  }

  await updateSession({ user: { cartId: null } });
}

export async function addToOrCreateCart(
  data: CreateCartInput | AddCartLineItemsInput['data'],
): Promise<void> {
  const cartId = await getCartId();
  const cart = await validateCartId(cartId);

  if (cart) {
    const response = await addCartLineItem(cart.entityId, data);

    if (!response.data.cart.addCartLineItems?.cart?.entityId) {
      throw new MissingCartError();
    }

    unstable_expireTag(TAGS.cart);

    return;
  }

  const createResponse = await createCart(data);

  if (!createResponse.data.cart.createCart?.cart?.entityId) {
    throw new MissingCartError();
  }

  await setCartId(createResponse.data.cart.createCart.cart.entityId);

  unstable_expireTag(TAGS.cart);
}
