export const ACTIONS = {
  add: 'ADD_TO_CART',
  remove: 'REMOVE_FROM_CART',
};

const addProductToCart = (product, state) => {
  console.log(product, 'product');

  console.log(state, 'state');

  const updatedCart = [...state];
  const updatedItemIndex = updatedCart.findIndex((item) => item.id === product.id);

  if (updatedItemIndex < 0) {
    updatedCart.push({ ...product });
  } else {
    const updatedItem = {
      ...updatedCart[updatedItemIndex],
    };

    updatedItem.quantity += product.quantity;
    updatedCart[updatedItemIndex] = updatedItem;
  }

  return updatedCart;
};

const removeProductFromCart = (productId, state) => {
  const updatedCart = [...state];
  const updatedItemIndex = updatedCart.findIndex((item) => item.id === productId);

  updatedCart.splice(updatedItemIndex, 1);

  return updatedCart;
};

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.add:
      return addProductToCart(action.payload, state);

    case ACTIONS.remove:
      return removeProductFromCart(action.payload, state);

    default:
      return state;
  }
};
