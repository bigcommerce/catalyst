export const ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_TOTAL_QUANTITY: 'UPDATE_CART',
  UPDATE_CART_ITEMS: 'UPDATE_CART_ITEMS',
};

const getTotalQuantity = (items) => {
  const res = items.reduce((acc, curr) => {
    return (acc = +curr.quantity);
  }, 0);

  console.log(res, 'res');

  return res;
};

const addProductToCart = (newItem, state) => {
  const cartItems = [...state.cartItems];
  const cartItemIndex = cartItems.findIndex((item) => item.id === newItem.id);

  if (cartItemIndex < 0) {
    cartItems.push({ ...newItem });
  } else {
    const cartItem = {
      ...cartItems[cartItemIndex],
    };

    cartItem.quantity += newItem.quantity;
    cartItems[cartItemIndex] = cartItem;
  }

  const totalQuantity = getTotalQuantity(cartItems);

  return { ...state, cartItems, totalQuantity };
};

const removeProductFromCart = (itemId, state) => {
  const cartItems = [...state.cartItems];
  const cartItemIndex = cartItems.findIndex((item) => item.id === itemId);

  cartItems.splice(cartItemIndex, 1);

  const totalQuantity = getTotalQuantity(cartItems);

  return { ...state, cartItems, totalQuantity };
};

const updateTotalQuantity = (totalQuantity, state) => {
  return { ...state, totalQuantity };
};

const updateCartItems = (items, state) => {
  console.log(items, 'items in updateCartItems');

  const cartItems = items.map((item) => {

    const { brand, name, imageUrl, entityId, variantEntityId, quantity } = item;

    return { brand, name, imageUrl, entityId, variantEntityId, quantity };
  });
  console.log(cartItems, 'cartItems in updateCartItems');
  
  return { ...state, cartItems };
};

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TO_CART:
      return addProductToCart(action.payload, state);

    case ACTIONS.REMOVE_FROM_CART:
      return removeProductFromCart(action.payload, state);

    case ACTIONS.UPDATE_TOTAL_QUANTITY:
      return updateTotalQuantity(action.payload, state);

    case ACTIONS.UPDATE_CART_ITEMS:
      return updateCartItems(action.payload, state);

    default:
      return state;
  }
};
