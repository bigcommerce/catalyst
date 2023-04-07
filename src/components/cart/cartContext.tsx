import { createContext, PropsWithChildren, useEffect, useReducer } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import {
  addCartLineItemMutation,
  AddCartLineItemMutation,
  createCartMutation,
  deleteCartLineItemMutation,
  DeleteCartLineItemMutation,
} from './mutations';
import { getCartQuery, GetCartQuery } from './queries';
import { ACTION_TYPES, CartState, reducer } from './reducer';
import { getCookie, setCookie } from './utils';

export const defaultCart: CartState = {
  amount: {
    value: 0,
    currencyCode: '',
  },
  cartItems: [],
  totalQuantity: 0,
};

interface CartContext {
  cart: typeof defaultCart;
  addCartLineItem: (productEntityId: string) => Promise<void>;
  deleteCartLineItem: (lineItemEntityId: string) => Promise<void>;
  getCart: (cartId: string) => Promise<void>;
}

export const CartContext = createContext<CartContext>({});

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
    isObjWithField(data.site.cart.lineItems, 'totalQuantity') && // can be 0
    isObjWithField(data.site.cart, 'amount') &&
    isObjWithField(data.site.cart.amount, 'value')
  ) {
    return true;
  }

  return false;
};

const isAddCartLineItemMutation = (data: unknown): data is AddCartLineItemMutation => {
  if (
    isObjWithField(data, 'cart') &&
    isObjWithField(data.cart, 'addCartLineItems') &&
    isObjWithField(data.cart.addCartLineItems, 'cart') &&
    isObjWithField(data.cart.addCartLineItems.cart, 'lineItems') &&
    isObjWithField(data.cart.addCartLineItems.cart.lineItems, 'totalQuantity') &&
    isObjWithField(data.cart.addCartLineItems.cart, 'amount') &&
    isObjWithField(data.cart.addCartLineItems.cart.amount, 'value') &&
    isObjWithField(data.cart.addCartLineItems.cart.lineItems, 'physicalItems')
  ) {
    return true;
  }

  return false;
};

const isDeleteCartLineItemMutation = (data: unknown): data is DeleteCartLineItemMutation => {
  if (
    isObjWithField(data, 'cart') &&
    isObjWithField(data.cart, 'deleteCartLineItem') &&
    isObjWithField(data.cart.deleteCartLineItem, 'deletedLineItemEntityId') &&
    isObjWithField(data.cart.deleteCartLineItem, 'deletedCartEntityId') &&
    isObjWithField(data.cart.deleteCartLineItem, 'cart') &&
    isObjWithField(data.cart.deleteCartLineItem.cart, 'amount') &&
    isObjWithField(data.cart.deleteCartLineItem.cart.amount, 'value') &&
    isObjWithField(data.cart.deleteCartLineItem.cart, 'lineItems') &&
    isObjWithField(data.cart.deleteCartLineItem.cart.lineItems, 'physicalItems')
  ) {
    return true;
  }

  return false;
};

const CartContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, defaultCart);

  const getCart = async (cartId: string) => {
    const client = getBrowserClient();

    const data = await client.query({
      query: getCartQuery,
      variables: { entityId: cartId },
    });

    if (isGetCartQuery(data)) {
      dispatch({ type: ACTION_TYPES.GET_CART, payload: data });
    }
  };

  const addCartLineItem = async (productEntityId: string) => {
    const client = getBrowserClient();
    const cartEntityId = getCookie('cart_id');

    if (cartEntityId) {
      const data = await client.mutate({
        mutation: addCartLineItemMutation,
        variables: {
          addCartLineItemsInput: {
            cartEntityId,
            data: {
              lineItems: {
                quantity: 1,
                productEntityId,
              },
            },
          },
        },
      });

      if (isAddCartLineItemMutation(data)) {
        dispatch({ type: ACTION_TYPES.ADD_CART_ITEM, payload: data });
      }
    } else {
      const variables = {
        createCartInput: {
          lineItems: [
            {
              quantity: 1,
              productEntityId,
            },
          ],
        },
      };

      const data = await client.mutate({
        mutation: createCartMutation,
        variables,
      });

      setCookie('cart_id', data.cart.createCart.cart.entityId, 7);
      dispatch({ type: ACTION_TYPES.CREATE_CART, payload: data });
    }
  };

  const deleteCartLineItem = async (lineItemEntityId: string) => {
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

    if (isDeleteCartLineItemMutation(data)) {
      dispatch({ type: ACTION_TYPES.DELETE_CART_ITEM, payload: data });
    }
  };

  useEffect(() => {
    const cartId = getCookie('cart_id');

    if (cartId) {
      void getCart(cartId);
    }
  }, []);

  useEffect(() => {
    console.log(cart, 'cart state');
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        addCartLineItem,
        deleteCartLineItem,
        getCart,
        cart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContextProvider };
