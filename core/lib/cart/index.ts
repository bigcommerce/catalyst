'use server';

import { revalidateTag } from 'next/cache';

import { auth, getAnonymousSession, updateAnonymousSession, updateSession } from '~/auth';
import { TAGS } from '~/client/tags';
import { addCartLineItem, AddCartLineItemsInput } from '~/lib/cart/add-cart-line-item';
import { createCart, CreateCartInput } from '~/lib/cart/create-cart';
import { validateCartId } from '~/lib/cart/validate-cart';
import { getCurrentChannelId } from '~/lib/channel';

import {
  assignChannelCart,
  cartIdForChannel,
  type ChannelCartRecord,
  removeChannelCart,
} from './channel-cart';
import { MissingCartError } from './error';

async function readChannelCart(): Promise<ChannelCartRecord> {
  const anonymousSession = await getAnonymousSession();

  if (anonymousSession) {
    return {
      cartId: anonymousSession.user?.cartId,
      cartIds: anonymousSession.user?.cartIds,
    };
  }

  const session = await auth();

  return {
    cartId: session?.user?.cartId,
    cartIds: session?.user?.cartIds,
  };
}

async function writeChannelCart(record: {
  cartId: string | null;
  cartIds: Record<string, string>;
}) {
  const anonymousSession = await getAnonymousSession();

  if (anonymousSession) {
    await updateAnonymousSession({
      cartId: record.cartId,
      cartIds: record.cartIds,
    });

    return;
  }

  await updateSession({
    user: {
      cartId: record.cartId,
      cartIds: record.cartIds,
    },
  });
}

async function channelIdForCart(channelId?: string) {
  return channelId || (await getCurrentChannelId());
}

/**
 * Cart id for the current channel, or for `channelId` when the caller already knows it.
 * Route handlers pass `channelId` because they have no request locale.
 *
 * @param {string} [channelId] - Channel whose cart is read. Defaults to the current channel.
 * @returns {Promise<string | undefined>} The cart id, or `undefined` when that channel has none.
 */
export async function getCartId(channelId?: string): Promise<string | undefined> {
  const resolvedChannelId = await channelIdForCart(channelId);
  const stored = await readChannelCart();

  if (!resolvedChannelId) {
    return stored.cartId ?? undefined;
  }

  const selected = cartIdForChannel(stored, resolvedChannelId);

  if (selected.cartIdsToStore && selected.cartId) {
    try {
      await writeChannelCart({ cartId: selected.cartId, cartIds: selected.cartIdsToStore });
    } catch (error) {
      // A render cannot always write cookies. The id is still returned for this request, and the
      // next cart action stores the channel.
      // eslint-disable-next-line no-console
      console.error('Failed to store the cart channel', error);
    }
  }

  return selected.cartId;
}

/**
 * Stores `cartId` for the current channel without dropping carts for other channels.
 *
 * @param {string} cartId - Cart id to store.
 * @param {string} [channelId] - Channel that owns `cartId`. Defaults to the current channel.
 * @returns {Promise<void>} Resolves once the session cookie is written.
 */
export async function setCartId(cartId: string, channelId?: string): Promise<void> {
  const resolvedChannelId = await channelIdForCart(channelId);
  const stored = await readChannelCart();

  if (!resolvedChannelId) {
    await writeChannelCart({ cartId, cartIds: stored.cartIds ?? {} });

    return;
  }

  await writeChannelCart(assignChannelCart(stored, resolvedChannelId, cartId));
}

/**
 * Removes the cart for the current channel. Carts for other channels stay stored.
 *
 * @param {string} [channelId] - Channel whose cart is removed. Defaults to the current channel.
 * @returns {Promise<void>} Resolves once the session cookie is written.
 */
export async function clearCartId(channelId?: string): Promise<void> {
  const resolvedChannelId = await channelIdForCart(channelId);
  const stored = await readChannelCart();

  if (!resolvedChannelId) {
    await writeChannelCart({ cartId: null, cartIds: stored.cartIds ?? {} });

    return;
  }

  await writeChannelCart(removeChannelCart(stored, resolvedChannelId));
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

    revalidateTag(TAGS.cart, { expire: 0 });

    return;
  }

  const createResponse = await createCart(data);

  if (!createResponse.data.cart.createCart?.cart?.entityId) {
    throw new MissingCartError();
  }

  await setCartId(createResponse.data.cart.createCart.cart.entityId);

  revalidateTag(TAGS.cart, { expire: 0 });
}
