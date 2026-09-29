import { describe, expect, it } from 'vitest';

import {
  assignChannelCart,
  cartIdForChannel,
  cartIdForLogout,
  cartsAfterLogin,
  removeChannelCart,
} from './channel-cart';

const CHANNEL_A = '1844232';
const CHANNEL_B = '1899883';
const CART_A = '91054152-ca47-40a2-8da8-7e895eb8c3a3';
const CART_B = '198dc562-26f6-4cac-81b1-802d91166e1d';

describe('cartIdForChannel', () => {
  it('returns undefined when the session has no cart', () => {
    expect(cartIdForChannel({}, CHANNEL_A)).toEqual({ cartId: undefined });
  });

  it('does not return a cart stored for another channel', () => {
    expect(cartIdForChannel({ cartIds: { [CHANNEL_A]: CART_A } }, CHANNEL_B)).toEqual({
      cartId: undefined,
    });
  });

  it('returns the cart stored for the requested channel', () => {
    expect(
      cartIdForChannel({ cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B } }, CHANNEL_B),
    ).toEqual({ cartId: CART_B });
  });

  it('treats a legacy cart id as the cart of the channel that reads it', () => {
    expect(cartIdForChannel({ cartId: CART_A }, CHANNEL_A)).toEqual({
      cartId: CART_A,
      cartIdsToStore: { [CHANNEL_A]: CART_A },
    });
  });
});

describe('assignChannelCart', () => {
  it('keeps carts for other channels', () => {
    expect(assignChannelCart({ cartIds: { [CHANNEL_A]: CART_A } }, CHANNEL_B, CART_B)).toEqual({
      cartId: CART_B,
      cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B },
    });
  });
});

describe('cartsAfterLogin', () => {
  it('keeps other channels and stores the cart BigCommerce returned on the login channel', () => {
    expect(
      cartsAfterLogin({ cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B } }, CHANNEL_A, CART_B),
    ).toEqual({
      cartId: CART_B,
      cartIds: { [CHANNEL_A]: CART_B, [CHANNEL_B]: CART_B },
    });
  });

  it('adds the login channel without dropping the guest cart of another channel', () => {
    expect(cartsAfterLogin({ cartIds: { [CHANNEL_A]: CART_A } }, CHANNEL_B, CART_B)).toEqual({
      cartId: CART_B,
      cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B },
    });
  });

  it('drops only the login channel when BigCommerce returns no cart', () => {
    expect(cartsAfterLogin({ cartIds: { [CHANNEL_A]: CART_A } }, CHANNEL_B)).toEqual({
      cartId: null,
      cartIds: { [CHANNEL_A]: CART_A },
    });
  });

  it('turns a legacy cart id into a map entry for the login channel', () => {
    expect(cartsAfterLogin({ cartId: CART_A }, CHANNEL_A, CART_A)).toEqual({
      cartId: CART_A,
      cartIds: { [CHANNEL_A]: CART_A },
    });
  });
});

describe('cartIdForLogout', () => {
  it('returns the cart stored for the channel being logged out of', () => {
    expect(
      cartIdForLogout(
        { cartId: CART_A, cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B } },
        CHANNEL_B,
      ),
    ).toBe(CART_B);
  });

  it('returns null when that channel has no cart', () => {
    expect(cartIdForLogout({ cartIds: { [CHANNEL_A]: CART_A } }, CHANNEL_B)).toBeNull();
  });

  it('returns the legacy cart id when the session has no map', () => {
    expect(cartIdForLogout({ cartId: CART_A }, CHANNEL_B)).toBe(CART_A);
  });
});

describe('removeChannelCart', () => {
  it('removes only the requested channel', () => {
    expect(
      removeChannelCart({ cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B } }, CHANNEL_B),
    ).toEqual({
      cartId: null,
      cartIds: { [CHANNEL_A]: CART_A },
    });
  });

  it('stores an empty map for a legacy cart so it is not migrated again', () => {
    expect(removeChannelCart({ cartId: CART_A }, CHANNEL_A)).toEqual({
      cartId: null,
      cartIds: {},
    });
  });
});
