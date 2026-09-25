export interface ChannelCartRecord {
  cartId?: string | null;
  cartIds?: Record<string, string> | null;
}

export interface SelectedChannelCart {
  cartId: string | undefined;
  /**
   * Set when a legacy session has only `cartId`. The caller stores this once so the same id is
   * not reused for a different channel on the next request.
   */
  cartIdsToStore?: Record<string, string>;
}

/**
 * Cart id for `channelId`. A stored map wins. A session that has never stored a map still has a
 * single `cartId`; that id belongs to the channel asking first and must be written into the map.
 *
 * @param {ChannelCartRecord} record - Cart fields stored on the session.
 * @param {string} channelId - Channel asking for its cart.
 * @returns {SelectedChannelCart} The cart id, and a map to store when a legacy session is migrated.
 */
export function cartIdForChannel(
  record: ChannelCartRecord,
  channelId: string,
): SelectedChannelCart {
  const mappedCartId = record.cartIds?.[channelId];

  if (mappedCartId) {
    return { cartId: mappedCartId };
  }

  if (record.cartIds != null) {
    return { cartId: undefined };
  }

  if (!record.cartId) {
    return { cartId: undefined };
  }

  return {
    cartId: record.cartId,
    cartIdsToStore: { [channelId]: record.cartId },
  };
}

/**
 * Guest carts kept across login. BigCommerce may merge the guest cart into the account cart, so
 * the id it returns replaces only the channel the shopper logged in on.
 *
 * @param {ChannelCartRecord} guest - Cart fields from the anonymous session.
 * @param {string} [channelId] - Channel the shopper is logging in on.
 * @param {string} [loginResultCartId] - Cart id returned by the login mutation.
 * @returns {object} Cart fields for the customer session.
 */
export function cartsAfterLogin(
  guest: ChannelCartRecord,
  channelId: string | undefined,
  loginResultCartId?: string,
): { cartId: string | null; cartIds: Record<string, string> } {
  const base: ChannelCartRecord =
    guest.cartIds == null && guest.cartId && channelId
      ? { cartId: guest.cartId, cartIds: { [channelId]: guest.cartId } }
      : guest;

  if (!channelId) {
    return {
      cartId: loginResultCartId ?? base.cartId ?? null,
      cartIds: { ...(base.cartIds ?? {}) },
    };
  }

  if (loginResultCartId) {
    return assignChannelCart(base, channelId, loginResultCartId);
  }

  return removeChannelCart(base, channelId);
}

/**
 * Cart id to send to logout for `channelId`. A stored map wins. A session that never stored a
 * map still has a single `cartId`.
 *
 * @param {ChannelCartRecord} record - Cart fields stored on the customer session.
 * @param {string} [channelId] - Channel the shopper is logging out of.
 * @returns {string | null} That channel's cart id, or `null` when it has none.
 */
export function cartIdForLogout(record: ChannelCartRecord, channelId?: string): string | null {
  if (channelId && record.cartIds != null) {
    return record.cartIds[channelId] ?? null;
  }

  return record.cartId ?? null;
}

/**
 * Records `cartId` for `channelId` and leaves every other channel's cart in place.
 *
 * @param {ChannelCartRecord} record - Cart fields already stored on the session.
 * @param {string} channelId - Channel that owns `cartId`.
 * @param {string} cartId - Cart id to store for that channel.
 * @returns {object} The session fields to write.
 */
export function assignChannelCart(
  record: ChannelCartRecord,
  channelId: string,
  cartId: string,
): { cartId: string; cartIds: Record<string, string> } {
  return {
    cartId,
    cartIds: { ...(record.cartIds ?? {}), [channelId]: cartId },
  };
}

/**
 * Drops the cart for `channelId`. An empty map is stored when the session only had a legacy
 * `cartId`, so that id is not migrated again on the next read.
 *
 * @param {ChannelCartRecord} record - Cart fields already stored on the session.
 * @param {string} channelId - Channel whose cart is removed.
 * @returns {object} The session fields to write.
 */
export function removeChannelCart(
  record: ChannelCartRecord,
  channelId: string,
): { cartId: null; cartIds: Record<string, string> } {
  const cartIds = Object.fromEntries(
    Object.entries(record.cartIds ?? {}).filter(([id]) => id !== channelId),
  );

  return { cartId: null, cartIds };
}
