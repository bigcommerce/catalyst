import { beforeEach, describe, expect, it, vi } from 'vitest';

interface StoredCart {
  cartId?: string | null;
  cartIds?: Record<string, string> | null;
}

const getCurrentChannelId = vi.fn<() => Promise<string | undefined>>();
const getAnonymousSession = vi.fn<() => Promise<{ user: StoredCart } | null>>();
const updateAnonymousSession = vi.fn<(user: StoredCart) => Promise<void>>();
const auth = vi.fn<() => Promise<{ user: StoredCart } | null>>();
const updateSession = vi.fn<(data: { user: StoredCart }) => Promise<void>>();

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

vi.mock('~/lib/channel', () => ({
  getCurrentChannelId: () => getCurrentChannelId(),
}));

vi.mock('~/auth', () => ({
  auth: () => auth(),
  getAnonymousSession: () => getAnonymousSession(),
  updateAnonymousSession: (user: StoredCart) => updateAnonymousSession(user),
  updateSession: (data: { user: StoredCart }) => updateSession(data),
}));

vi.mock('~/lib/cart/validate-cart', () => ({
  validateCartId: vi.fn(),
}));

vi.mock('~/lib/cart/add-cart-line-item', () => ({
  addCartLineItem: vi.fn(),
}));

vi.mock('~/lib/cart/create-cart', () => ({
  createCart: vi.fn(),
}));

import { clearCartId, getCartId, setCartId } from './index';

const CHANNEL_A = '1844232';
const CHANNEL_B = '1899883';
const CART_A = '91054152-ca47-40a2-8da8-7e895eb8c3a3';
const CART_B = '198dc562-26f6-4cac-81b1-802d91166e1d';

let guest: StoredCart | null;
let customer: StoredCart | null;

beforeEach(() => {
  guest = null;
  customer = null;
  getCurrentChannelId.mockReset();
  updateAnonymousSession.mockReset();
  updateSession.mockReset();
  getAnonymousSession.mockImplementation(() => Promise.resolve(guest ? { user: guest } : null));
  auth.mockImplementation(() => Promise.resolve(customer ? { user: customer } : null));
  updateAnonymousSession.mockImplementation((user: StoredCart) => {
    guest = user;

    return Promise.resolve();
  });
  updateSession.mockImplementation((data: { user: StoredCart }) => {
    customer = data.user;

    return Promise.resolve();
  });
});

describe('getCartId', () => {
  it('returns undefined when the session has no cart', async () => {
    guest = {};
    getCurrentChannelId.mockResolvedValue(CHANNEL_A);

    await expect(getCartId()).resolves.toBeUndefined();
    expect(updateAnonymousSession).not.toHaveBeenCalled();
  });

  it('does not return a cart stored for another channel', async () => {
    guest = { cartIds: { [CHANNEL_A]: CART_A } };
    getCurrentChannelId.mockResolvedValue(CHANNEL_B);

    await expect(getCartId()).resolves.toBeUndefined();
  });

  it('returns the cart for the channel passed by a route handler', async () => {
    guest = { cartIds: { [CHANNEL_B]: CART_B } };
    getCurrentChannelId.mockRejectedValue(new Error('no request locale'));

    await expect(getCartId(CHANNEL_B)).resolves.toBe(CART_B);
  });

  it('stores a legacy cart id on the channel that reads it', async () => {
    guest = { cartId: CART_A };
    getCurrentChannelId.mockResolvedValue(CHANNEL_A);

    await expect(getCartId()).resolves.toBe(CART_A);
    expect(guest).toEqual({
      cartId: CART_A,
      cartIds: { [CHANNEL_A]: CART_A },
    });

    getCurrentChannelId.mockResolvedValue(CHANNEL_B);

    await expect(getCartId()).resolves.toBeUndefined();
  });
});

describe('setCartId', () => {
  it('keeps the other channel when storing a cart', async () => {
    guest = { cartIds: { [CHANNEL_A]: CART_A } };
    getCurrentChannelId.mockResolvedValue(CHANNEL_B);

    await setCartId(CART_B);

    expect(guest).toEqual({
      cartId: CART_B,
      cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B },
    });

    getCurrentChannelId.mockResolvedValue(CHANNEL_A);

    await expect(getCartId()).resolves.toBe(CART_A);
  });

  it('writes a logged-in shopper cart to the customer session', async () => {
    customer = { cartIds: { [CHANNEL_A]: CART_A } };
    getCurrentChannelId.mockResolvedValue(CHANNEL_B);

    await setCartId(CART_B);

    expect(updateAnonymousSession).not.toHaveBeenCalled();
    expect(customer).toEqual({
      cartId: CART_B,
      cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B },
    });
  });
});

describe('clearCartId', () => {
  it('removes only the current channel', async () => {
    guest = { cartId: CART_B, cartIds: { [CHANNEL_A]: CART_A, [CHANNEL_B]: CART_B } };
    getCurrentChannelId.mockResolvedValue(CHANNEL_B);

    await clearCartId();

    expect(guest).toEqual({
      cartId: null,
      cartIds: { [CHANNEL_A]: CART_A },
    });

    getCurrentChannelId.mockResolvedValue(CHANNEL_A);

    await expect(getCartId()).resolves.toBe(CART_A);
  });
});
