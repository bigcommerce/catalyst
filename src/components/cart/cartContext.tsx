import { createContext, PropsWithChildren, useEffect, useReducer } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import { addProductToCartMutation, deleteCartLineItemMutation } from './mutations';
import { getCartQuery, GetCartQuery } from './queries';
import { ACTIONS, reducer } from './reducer';
import { getCookie } from './utils';

export const CartContext = createContext(null);

export const defaultCart = {
  amount: {
    value: 0,
    currencyCode: '',
  },
  cartItems: null,
  totalQuantity: 0,
};

const isObjWithField = (obj: unknown, field: string): obj is { [field: string]: unknown } => {
  if (typeof obj === 'object' && obj !== null && field in obj) {
    return true;
  }

  return false;
};
const isGetCartQuery = (data: unknown): data is GetCartQuery => {
  if (
    isObjWithField(data, 'site') &&
    isObjWithField(data.site, 'cart') &&
    isObjWithField(data.site.cart, 'lineItems') &&
    isObjWithField(data.site.cart.lineItems, 'physicalItems') &&
    isObjWithField(data.site.cart.lineItems, 'totalQuantity') &&
    isObjWithField(data.site.cart, 'amount') &&
    isObjWithField(data.site.cart.amount, 'value')
  ) {
    return true;
  }

  return false;
};

const CartContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, defaultCart);

  const getCart = async () => {
    const cartId = getCookie('cart_id');

    if (!cartId) {
      return;
    }

    const client = getBrowserClient();

    const data = await client.query({
      query: getCartQuery,
      variables: { entityId: cartId },
    });

    if (isGetCartQuery(data)) {
      dispatch({ type: 'GET_CART', payload: data });
    }
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

  const deleteCartItem = async (lineItemEntityId) => {
    const cartEntityId = getCookie('cart_id');
    const variables = {
      deleteCartLineItemInput: {
        cartEntityId,
        lineItemEntityId,
      },
    };
    const client = getBrowserClient();

    const data = await client.mutate({
      mutation: deleteCartLineItemMutation,
      variables,
    });

    dispatch({ type: ACTIONS.DELETE_CART_ITEM, payload: data });
  };

  useEffect(() => {
    void getCart();
  }, []);

  useEffect(() => {
    console.log(cart, 'cart state');
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        deleteCartItem,
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
