import { LineItems } from '../../pages/fragments';

import { defaultCart } from './cartContext';
import { AddProductToCartMutation } from './mutations';
import { GetCartQuery } from './queries';

type ActionType = 'GET_CART' | 'UPDATE_CART' | 'DELETE_CART_ITEM';
type ActionsType = Record<ActionType, ActionType>;

export const ACTIONS: ActionsType = {
  GET_CART: 'GET_CART',
  UPDATE_CART: 'UPDATE_CART',
  DELETE_CART_ITEM: 'DELETE_CART_ITEM',
};

type initCartState = typeof defaultCart;

type CartState = Omit<initCartState, 'cartItems'> & { cartItems: LineItems['physicalItems'] };

interface Action {
  type: keyof typeof ACTIONS;
  payload: unknown;
}

const getCart = (cart: GetCartQuery, state: CartState): CartState => {
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

const deleteCartItem = (cart, state) => {
  const { deletedLineItemEntityId } = cart.cart.deleteCartLineItem;
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

export const reducer = (state: CartState, action: Action) => {
  switch (action.type) {
    case ACTIONS.GET_CART:
      return getCart(action.payload, state);

    case ACTIONS.UPDATE_CART:
      return updateCart(action.payload, state);

    case ACTIONS.DELETE_CART_ITEM:
      return deleteCartItem(action.payload, state);

    default:
      return state;
  }
};
