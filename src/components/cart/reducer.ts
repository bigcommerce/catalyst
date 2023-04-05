export const ACTIONS = {
  GET_CART: 'GET_CART',
  UPDATE_CART: 'UPDATE_CART',
  DELETE_CART_ITEM: 'DELETE_CART_ITEM',
};

const getCart = (cart, state) => {
  const { physicalItems, totalQuantity } = cart.site.cart.lineItems;

  return {
    cartItems: physicalItems,
    totalQuantity,
  };
};

const updateCart = (cart, state) => {
  const { physicalItems, totalQuantity } = cart.cart.addCartLineItems.cart.lineItems;

  return {
    cartItems: physicalItems,
    totalQuantity,
  };
};

const deleteCartItem = (cart, state) => {
  const { deletedLineItemEntityId } = cart.cart.deleteCartLineItem;
  const { totalQuantity } = cart.cart.deleteCartLineItem.cart.lineItems;

  const cartItems = state.cartItems.filter((item) => {
    const res = item.entityId !== deletedLineItemEntityId;

    return res;
  });

  return {
    cartItems,
    totalQuantity,
  };
};

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.GET_CART:
      return getCart(action.payload, state);

    case ACTIONS.UPDATE_CART:
      return updateCart(action.payload, state);

    case ACTIONS.DELETE_CART_ITEM:
      return deleteCartItem(action.payload, state);

    default:
      return state;
  }
};
