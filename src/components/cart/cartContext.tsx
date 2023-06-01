import { createContext, PropsWithChildren, useEffect, useReducer } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import {
  addCartLineItemMutation,
  AddCartLineItemMutation,
  CreateCartMutation,
  createCartMutation,
  deleteCartLineItemMutation,
  DeleteCartLineItemMutation,
  DeleteCartMutation,
  deleteCartMutation,
} from './mutations';
import { getCartQuery, GetCartQuery } from './queries';
import { ACTION_TYPES, CartState, reducer } from './reducer';
import { eraseCookie, getCookie, setCookie } from './utils';

export const defaultCartState: CartState = {
  amount: {
    value: 0,
    currencyCode: '',
  },
  cartItems: [],
  totalQuantity: 0,
};

const API = {
  addCartLineItemMutation: '/api/cart/addCartLineItemMutation',
  createCartMutation: '/api/cart/createCartMutation',
  deleteCartMutation: '/api/cart/deleteCartMutation',
  deleteCartLineItemMutation: '/api/cart/deleteCartLineItemMutation',
  getCartQuery: '/api/cart/getCartQuery',
};

interface CartContext {
  cart: typeof defaultCartState;
  addCartLineItem: (
    productEntityId: number,
    variantEntityId: number | null | undefined,
  ) => Promise<void>;
  deleteCartLineItem: (lineItemEntityId: number) => Promise<void>;
  getCart: (cartId: string) => Promise<void>;
}

export const CartContext = createContext<CartContext>({});

const isObjWithField = (obj: unknown, field: string): obj is { [field: string]: unknown } => {
  if (typeof obj === 'object' && obj !== null && field in obj) {
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

const isCreateCreateCartMutation = (data: unknown): data is CreateCartMutation => {
  if (
    isObjWithField(data, 'cart') &&
    isObjWithField(data.cart, 'createCart') &&
    isObjWithField(data.cart.createCart, 'cart') &&
    isObjWithField(data.cart.createCart.cart, 'amount') &&
    isObjWithField(data.cart.createCart.cart, 'lineItems') &&
    isObjWithField(data.cart.createCart.cart.lineItems, 'physicalItems') &&
    isObjWithField(data.cart.createCart.cart.amount, 'value')
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

const isDeleteCartMutation = (data: unknown): data is DeleteCartMutation => {
  if (
    isObjWithField(data, 'cart') &&
    isObjWithField(data.cart, 'deleteCart') &&
    isObjWithField(data.cart.deleteCart, 'deletedCartEntityId')
  ) {
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

const CartContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, defaultCartState);

  const addCartLineItem = async (
    productEntityId: number,
    variantEntityId: number | null | undefined,
    quantity = 1,
  ) => {
    const client = getBrowserClient();
    const cartEntityId = getCookie('cart_id');

    const lineItem = {
      quantity,
      productEntityId,
      variantEntityId,
    };

    if (cartEntityId) {
      const variables = {
        addCartLineItemsInput: {
          cartEntityId,
          data: {
            lineItems: [lineItem],
          },
        },
      };

      const data = await client.mutate({
        mutation: addCartLineItemMutation,
        variables,
      });

      if (isAddCartLineItemMutation(data)) {
        dispatch({ type: ACTION_TYPES.ADD_CART_ITEM, payload: data });
      }
    } else {
      const data = await client.mutate({
        mutation: createCartMutation,
        variables: {
          createCartInput: {
            lineItems: [lineItem],
          },
        },
      });

      if (isCreateCreateCartMutation(data)) {
        setCookie('cart_id', data.cart.createCart.cart.entityId, 7);
        dispatch({ type: ACTION_TYPES.CREATE_CART, payload: data });
      }
    }
  };

  const addCartLineItem2 = async (
    productEntityId: number,
    variantEntityId: number | null | undefined,
    quantity = 1,
  ) => {
    if (!cart.cartItems.length) {
      const res = await fetch(API.addCartLineItemMutation, {
        method: 'POST',
        body: JSON.stringify({ productEntityId, variantEntityId, quantity }),
      });
      const data: unknown = await res.json();

      if (isAddCartLineItemMutation(data)) {
        // dispatch({ type: ACTION_TYPES.ADD_CART_ITEM, payload: data });
      }
    } else {
      const res = await fetch(API.createCartMutation, {
        method: 'POST',
        body: JSON.stringify({ productEntityId, variantEntityId, quantity }),
      });

      const data: unknown = await res.json();

      if (isCreateCreateCartMutation(data)) {
        // dispatch({ type: ACTION_TYPES.CREATE_CART, payload: data });
      }
    }
  };

  //   useEffect(() => {
  //     void addCartLineItem2(86, 1225);
  //   }, []);

  const deleteCartLineItem = async (lineItemEntityId: number) => {
    const cartEntityId = getCookie('cart_id');
    const client = getBrowserClient();

    if (cart.cartItems.length === 1) {
      const data = await client.mutate({
        mutation: deleteCartMutation,
        variables: {
          deleteCartInput: {
            cartEntityId,
          },
        },
      });

      if (isDeleteCartMutation(data)) {
        dispatch({ type: ACTION_TYPES.DELETE_CART, payload: data });
        eraseCookie('cart_id');
      }
    } else {
      const data = await client.mutate({
        mutation: deleteCartLineItemMutation,
        variables: {
          deleteCartLineItemInput: {
            cartEntityId,
            lineItemEntityId,
          },
        },
      });

      if (isDeleteCartLineItemMutation(data)) {
        dispatch({ type: ACTION_TYPES.DELETE_CART_ITEM, payload: data });
      }
    }
  };

  const deleteCartLineItem2 = async (lineItemEntityId: string) => {
    if (cart.cartItems.length === 1) {
      const res = await fetch(API.deleteCartMutation, {
        method: 'POST',
        body: null,
      });

      const data: unknown = await res.json();

      if (isDeleteCartMutation(data)) {
        // dispatch({ type: ACTION_TYPES.DELETE_CART, payload: data });
      }
    } else {
      const res = await fetch(API.deleteCartLineItemMutation, {
        method: 'POST',
        body: JSON.stringify({ lineItemEntityId }),
      });

      const data: unknown = await res.json();

      if (isDeleteCartLineItemMutation(data)) {
        // dispatch({ type: ACTION_TYPES.DELETE_CART_ITEM, payload: data });
      }
    }
  };

  //   useEffect(() => {
  //     void deleteCartLineItem2('addf3f63-e512-4513-ae7d-96bc7af56f2f');
  //   }, []);

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

  const getCart2 = async (cartId: string) => {
    const res = await fetch(API.getCartQuery, {
      method: 'POST',
      body: JSON.stringify({ cartId }),
    });
    const data: unknown = await res.json();

    if (isGetCartQuery(data)) {
      console.log(data, 'data in getCart2');
      // dispatch({ type: ACTION_TYPES.GET_CART, payload: data });
    }
  };

  useEffect(() => {
    const cartId = getCookie('cart_id');

    if (cartId) {
      void getCart(cartId);
    }
  }, []);

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
