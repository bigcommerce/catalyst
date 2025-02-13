'use client';

import { createContext, ReactNode, useContext, useReducer } from 'react';

interface CommonContext {
  open: boolean;
  productData: any;
  cartData: any;
  setProductDataFn: (items?: any) => void;
  handlePopup: (data?: any) => void;
  setCartDataFn: (items?: any) => void;
}

const CommonContext = createContext<CommonContext>({
  open: false,
  productData: {},
  cartData: {},
  setProductDataFn: () => {},
  handlePopup: () => {},
  setCartDataFn: () => {},
});

interface CommonState {
  items: {
    open: boolean;
    productData: any;
    cartData: any;
  };
}

type CommonAction =
  | { type: 'UPDATE_ITEM'; payload: any }
  | { type: 'DISPLAY_POPUP'; payload: boolean }
  | { type: 'UPDATE_CART'; payload: any };

function CommonReducer(state: CommonState, action: CommonAction): CommonState {
  switch (action.type) {
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: {
          ...state.items,
          open: true,
          productData: action.payload,
        },
      };

    case 'DISPLAY_POPUP':
      return {
        ...state,
        items: {
          ...state.items,
          open: action.payload,
        },
      };

    case 'UPDATE_CART':
      return {
        ...state,
        items: {
          ...state.items,
          cartData: action.payload,
        },
      };

    default:
      return state;
  }
}

export const CommonProvider = ({ children }: { children: ReactNode }) => {
  const [commonState, commonDispatch] = useReducer(CommonReducer, {
    items: {
      open: false,
      productData: {},
      cartData: {},
    },
  });

  const handlePopup = (open: boolean) => {
    commonDispatch({
      type: 'DISPLAY_POPUP',
      payload: open,
    });
  };

  const setProductDataFn = (items: any) => {
    commonDispatch({
      type: 'UPDATE_ITEM',
      payload: items,
    });
  };

  const setCartDataFn = (items: any) => {
    commonDispatch({
      type: 'UPDATE_CART',
      payload: items,
    });
  };

  const value = {
    open: commonState.items.open,
    productData: commonState.items.productData,
    cartData: commonState.items.cartData,
    setProductDataFn,
    handlePopup,
    setCartDataFn,
  };

  return <CommonContext.Provider value={value}>{children}</CommonContext.Provider>;
};

export const useCommonContext = () => {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error('useCommonContext must be used within a CommonProvider');
  }
  return context;
};
