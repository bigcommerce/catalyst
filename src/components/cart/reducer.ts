import { LineItems } from '../../pages/fragments';

import { AddCartLineItemMutation, DeleteCartLineItemMutation } from './mutations';
import { GetCartQuery } from './queries';

type ActionMap<PayloadItem extends { [key in keyof Payload]: Payload[keyof Payload] }> = {
  [Key in keyof PayloadItem]: {
    type: Key;
    payload: PayloadItem[Key];
  };
};

export enum ACTION_TYPES {
  GET_CART = 'GET_CART',
  ADD_CART_ITEM = 'UPDATE_CART',
  DELETE_CART_ITEM = 'DELETE_CART_ITEM',
}

interface Payload {
  [ACTION_TYPES.GET_CART]: GetCartQuery;
  [ACTION_TYPES.ADD_CART_ITEM]: AddCartLineItemMutation;
  [ACTION_TYPES.DELETE_CART_ITEM]: DeleteCartLineItemMutation;
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

const updateCart = (cart: AddCartLineItemMutation, state: CartState): CartState => {
  const {
    amount: { value },
    lineItems: { physicalItems, totalQuantity },
  } = cart.cart.addCartLineItems.cart;

  return {
    amount: { ...state.amount, value },
    cartItems: physicalItems,
    totalQuantity,
  };
};

const deleteCartItem = (cart: DeleteCartLineItemMutation, state: CartState): CartState => {
  const {
    amount: { value },
    lineItems: { physicalItems, totalQuantity },
  } = cart.cart.deleteCartLineItem.cart;

  return {
    amount: { ...state.amount, value },
    cartItems: physicalItems,
    totalQuantity,
  };
};

export const reducer = (state: CartState, action: Actions) => {
  switch (action.type) {
    case ACTION_TYPES.GET_CART:
      return getCart(action.payload);

    case ACTION_TYPES.ADD_CART_ITEM:
      return updateCart(action.payload, state);

    case ACTION_TYPES.DELETE_CART_ITEM:
      return deleteCartItem(action.payload, state);

    default:
      return state;
  }
};
