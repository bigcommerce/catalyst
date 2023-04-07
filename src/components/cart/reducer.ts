import { LineItems } from '../../pages/fragments';

import { defaultCart } from './cartContext';
import {
  AddCartLineItemMutation,
  CreateCartMutation,
  DeleteCartLineItemMutation,
  DeleteCartMutation,
} from './mutations';
import { GetCartQuery } from './queries';

type ActionMap<PayloadItem extends { [key in keyof Payload]: Payload[keyof Payload] }> = {
  [Key in keyof PayloadItem]: {
    type: Key;
    payload: PayloadItem[Key];
  };
};

export enum ACTION_TYPES {
  ADD_CART_ITEM = 'UPDATE_CART',
  CREATE_CART = 'CREATE_CART',
  DELETE_CART_ITEM = 'DELETE_CART_ITEM',
  DELETE_CART = 'DELETE_CART',
  GET_CART = 'GET_CART',
}

interface Payload {
  [ACTION_TYPES.ADD_CART_ITEM]: AddCartLineItemMutation;
  [ACTION_TYPES.CREATE_CART]: CreateCartMutation;
  [ACTION_TYPES.DELETE_CART_ITEM]: DeleteCartLineItemMutation;
  [ACTION_TYPES.DELETE_CART]: DeleteCartMutation;
  [ACTION_TYPES.GET_CART]: GetCartQuery;
}

type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

export interface CartState {
  amount: {
    value: number;
    currencyCode: string;
  };
  cartItems: LineItems['physicalItems'] | [];
  totalQuantity: number;
}

const getCart = (cart: GetCartQuery): CartState => {
  const {
    amount,
    lineItems: { physicalItems, totalQuantity },
  } = cart.site.cart;

  return {
    amount,
    cartItems: physicalItems,
    totalQuantity,
  };
};

const updateCart = (cart: AddCartLineItemMutation): CartState => {
  const {
    amount,
    lineItems: { physicalItems, totalQuantity },
  } = cart.cart.addCartLineItems.cart;

  return {
    amount,
    cartItems: physicalItems,
    totalQuantity,
  };
};

const deleteCartItem = (cart: DeleteCartLineItemMutation): CartState => {
  const {
    amount,
    lineItems: { physicalItems, totalQuantity },
  } = cart.cart.deleteCartLineItem.cart;

  return {
    amount,
    cartItems: physicalItems,
    totalQuantity,
  };
};

const deleteCart = (cart: DeleteCartMutation, state: CartState): CartState => {
  if (cart.cart.deleteCart.deletedCartEntityId) {
    return { ...defaultCart };
  }

  return state;
};

const createCart = (cart: CreateCartMutation): CartState => {
  const { amount } = cart.cart.createCart.cart;
  const { physicalItems, totalQuantity } = cart.cart.createCart.cart.lineItems;

  const newCart = {
    amount,
    cartItems: physicalItems,
    totalQuantity,
  };

  return newCart;
};

export const reducer = (state: CartState, action: Actions) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_CART_ITEM:
      return updateCart(action.payload);

    case ACTION_TYPES.CREATE_CART:
      return createCart(action.payload);

    case ACTION_TYPES.DELETE_CART_ITEM:
      return deleteCartItem(action.payload);

    case ACTION_TYPES.DELETE_CART:
      return deleteCart(action.payload, state);

    case ACTION_TYPES.GET_CART:
      return getCart(action.payload);

    default:
      return state;
  }
};
