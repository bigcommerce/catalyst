import { createContext, useEffect, useReducer } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import { addProductToCartMutation } from './addProductToCartMutation';
import { getCartQuery, getCartQueryWithId, getSmallCartQueryWithId } from './getCartQuery';
import { ACTIONS, reducer } from './reducer';
import { getCookie } from './utils';

export const CartContext = createContext(null);

const defaultCart = {
  cartItems: [],
  totalQuantity: 0,
};

const CartContextProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, defaultCart);

  const addProductToCart = (product) => {
    dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
  };

  const removeProductFromCart = (productId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: productId });
  };

  const updateTotalQuantity = (totalQuantity) => {
    dispatch({ type: ACTIONS.UPDATE_TOTAL_QUANTITY, payload: totalQuantity });
  };

  const updateCartItems = (items) => {
    dispatch({ type: ACTIONS.UPDATE_CART_ITEMS, payload: items });
  };

  const updateCart = async (productEntityId) => {
    const cartEntityId = getCookie('cart_id');
    const variables = {
      addCartLineItemsInput: {
        cartEntityId,
        data: {
          lineItem: {
            quantity: 1,
            productEntityId,
          },
        },
      },
    };

    console.log(variables, 'variables in updateCart');

    const client = getBrowserClient();

    const data = await client.mutate({
      mutation: addProductToCartMutation,
      variables,
    });

    console.log(data, 'data in updateCart');

    dispatch({ type: ACTIONS.UPDATE_CART, payload: data });
  };

  useEffect(() => {
    const getCartWithId = async (entityId: string) => {
      const client = getBrowserClient();

      const res = await client.query({
        query: getCartQueryWithId,
        variables: { entityId },
      });

      console.log(res, 'res in getCartWithId');

      return res;
    };

    const cartId = getCookie('cart_id');

    // console.log(cartId, 'cartId');

    // void getCart();
    // void createCart();
    void (async () => {
      if (cartId) {
        const cart = await getCartWithId(cartId);

        // console.log(
        //   cart.site.cart.lineItems.physicalItems,
        //   'cart.site.cart.lineItems.physicalItems',
        // );

        updateCartItems(cart.site.cart.lineItems.physicalItems);
        updateTotalQuantity(cart.site.cart.lineItems.totalQuantity);
      }
    })();
  }, []);

  useEffect(() => {
    console.log(cart, 'cart');
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        addProductToCart,
        removeProductFromCart,
        updateTotalQuantity,
        updateCartItems,
        updateCart,
        cart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContextProvider };
