import { createContext, useEffect, useReducer } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import { addProductToCartMutation } from './addProductToCartMutation';
import { getCartQueryWithId } from './getCartQuery';
import { ACTIONS, reducer } from './reducer';
import { getCookie } from './utils';

export const CartContext = createContext(null);

const defaultCart = {
  cartItems: [],
  totalQuantity: 0,
};

const CartContextProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, defaultCart);

  const getCart = async () => {
    const cartId = getCookie('cart_id');

    if (!cartId) {
      return;
    }

    const client = getBrowserClient();

    const data = await client.query({
      query: getCartQueryWithId,
      variables: { entityId: cartId },
    });

    dispatch({ type: ACTIONS.GET_CART, payload: data });
  };

  const updateCart = async (productEntityId) => {
    const cartEntityId = getCookie('cart_id');
    const variables = {
      addCartLineItemsInput: {
        cartEntityId,
        data: {
          lineItems: {
            quantity: 1,
            productEntityId,
          },
        },
      },
    };

    const client = getBrowserClient();

    const data = await client.mutate({
      mutation: addProductToCartMutation,
      variables,
    });

    dispatch({ type: ACTIONS.UPDATE_CART, payload: data });
  };

  useEffect(() => {
    void getCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        getCart,
        updateCart,
        cart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContextProvider };
