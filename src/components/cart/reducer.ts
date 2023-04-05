export const ACTIONS = {
  GET_CART: 'GET_CART',
  UPDATE_CART: 'UPDATE_CART',
  DELETE_CART_ITEM: 'DELETE_CART_ITEM',
};

const getCart = (cart, state) => {
  const {
    amount,
    lineItems: { physicalItems, totalQuantity },
  } = cart.site.cart;

  return {
    amount,
    cartItems: physicalItems,
    totalQuantity,
  };
};

const updateCart = (cart, state) => {
  const {
    amount: { value },
    lineItems: { physicalItems, totalQuantity },
  } = cart.cart.addCartLineItems.cart;

  return {
    amount: { ...state.amount, value },
    cartItems: physicalItems,
    totalQuantity,
  };
};

const deleteCartItem = (cart, state) => {
  const { deletedLineItemEntityId } = cart.cart.deleteCartLineItem;
  const {
    amount: { value },
    lineItems: { totalQuantity },
  } = cart.cart.deleteCartLineItem.cart;

  const cartItems = state.cartItems.filter((item) => {
    const res = item.entityId !== deletedLineItemEntityId;

    return res;
  });

  return {
    amount: { ...state.amount, value },
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
