import { createContext, PropsWithChildren, useEffect, useReducer } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import {
  addProductToCartMutation,
  AddProductToCartMutation,
  deleteCartLineItemMutation,
  DeleteCartLineItemMutation,
} from './mutations';
import { getCartQuery, GetCartQuery } from './queries';
import { CartState, reducer, Types } from './reducer';
import { getCookie } from './utils';

export const defaultCart: CartState = {
  amount: {
    value: 0,
    currencyCode: '',
  },
  cartItems: null,
  totalQuantity: 0,
};

interface CartContext {
  cart: typeof defaultCart;
  deleteCartItem: (lineItemEntityId: string) => Promise<void>;
  getCart: () => Promise<void>;
  updateCart: (productEntityId: string) => Promise<void>;
}

export const CartContext = createContext<CartContext | null>(null);

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

const isAddProductToCartMutation = (data: unknown): data is AddProductToCartMutation => {
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
      dispatch({ type: Types.Get, payload: data });
    }
  };

  const updateCart = async (productEntityId: string) => {
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

    if (isAddProductToCartMutation(data)) {
      dispatch({ type: Types.Update, payload: data });
    }
  };

  const deleteCartItem = async (lineItemEntityId: string) => {
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
      dispatch({ type: Types.Delete, payload: data });
    }
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
