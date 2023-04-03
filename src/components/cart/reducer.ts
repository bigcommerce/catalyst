export const ACTIONS = {
  GET_CART: 'GET_CART',
  UPDATE_CART: 'UPDATE_CART',
};

const getCart = (cart, state) => {
  console.log(cart, 'cart in getCart action');

  const { physicalItems, totalQuantity } = cart.site.cart.lineItems;

  return {
    cartItems: physicalItems,
    totalQuantity,
  };
};

const updateCart = (cart, state) => {
  console.log(cart, 'cart in updateCart action');

  const { physicalItems, totalQuantity } = cart.cart.addCartLineItems.cart.lineItems;

  return {
    cartItems: physicalItems,
    totalQuantity,
  };
};

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.GET_CART:
      return getCart(action.payload, state);

    case ACTIONS.UPDATE_CART:
      return updateCart(action.payload, state);

    default:
      return state;
  }
};
