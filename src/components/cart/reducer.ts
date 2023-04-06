import { LineItems } from '../../pages/fragments';

import { defaultCart } from './cartContext';
import { AddProductToCartMutation, DeleteCartLineItemMutation } from './mutations';
import { GetCartQuery } from './queries';

type ActionMap<M extends { [key in keyof Payload]: Payload[keyof Payload] }> = {
  [Key in keyof M]: {
    type: Key;
    payload: M[Key];
  };
};

enum Types {
  Get = 'GET_CART',
  Update = 'UPDATE_CART',
  Delete = 'DELETE_CART_ITEM',
}

interface Payload {
  [Types.Get]: GetCartQuery;
  [Types.Update]: AddProductToCartMutation;
  [Types.Delete]: DeleteCartLineItemMutation;
}

type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

type ActionType = 'GET_CART' | 'UPDATE_CART' | 'DELETE_CART_ITEM';
type ActionsType = Record<ActionType, ActionType>;

type initCartState = typeof defaultCart;

type CartState = Omit<initCartState, 'cartItems'> & { cartItems: LineItems['physicalItems'] };

export const ACTIONS: ActionsType = {
  GET_CART: 'GET_CART',
  UPDATE_CART: 'UPDATE_CART',
  DELETE_CART_ITEM: 'DELETE_CART_ITEM',
};

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

const updateCart = (
  cart: AddProductToCartMutation,
  state: initCartState | CartState,
): CartState => {
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
    case Types.Get:
      return getCart(action.payload);

    case Types.Update:
      return updateCart(action.payload, state);

    case Types.Delete:
      return deleteCartItem(action.payload, state);

    default:
      return state;
  }
};
