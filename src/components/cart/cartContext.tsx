import { createContext, useReducer } from 'react';

import { ACTIONS, reducer } from './reducer';

export const CartContext = createContext(null);

const CartContextProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(reducer, []);

  const addProductToCart = (product) => {
    dispatch({ type: ACTIONS.add, payload: product });
  };

  const removeProductFromCart = (productId) => {
    dispatch({ type: ACTIONS.remove, payload: productId });
  };

  return (
    <CartContext.Provider value={{ addProductToCart, removeProductFromCart, cart: cartState }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContextProvider };
