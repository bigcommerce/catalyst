'use client';

import { createContext, ReactNode, useContext, useReducer } from 'react';

interface CommonContext {
  open: any;
  productData: any;
  cartData: any;
  setProductDataFn: (items?: any) => void;
  handlePopup: (data?: any) => void;
  setCartDataFn: (items?: any) => void;
}

const CommonContext = createContext<CommonContext | undefined>({
  open: false,
  productData: {},
  cartData: {},
  setProductDataFn: () => { },
  handlePopup: () => { },
  setCartDataFn: () => { },
});

function CommonReducer(state: any, action: any) {
  if(action.type === 'UPDATE_ITEM') {
    return {
      items: {
        open: true,
        productData: action.payload,
        cartData: { ...state.items.cartData },
      },
    };
  } else if(action.type === 'DISPLAY_POPUP') {
    return {
      items: {
        productData: { ...state.items.productData },
        open: action.payload,
        cartData: { ...state.items.cartData },
      },
    };
  } else if(action.type === 'UPDATE_CART') {
    return {
      items: {
        productData: { ...state.items.productData },
        open: state.items.open,
        cartData: action.payload,
      },
    };
  }
  return state;
}

export const CommonProvider = ({ children }: { children: ReactNode }) => {
  const [commonState, commonDispatch] = useReducer(CommonReducer, {
    items: {
      open: false,
      productData: {},
      cartData: {}
    }
  });

  const handlePopup = (open: any) => {
    commonDispatch({
      type: 'DISPLAY_POPUP',
      payload: open
    });
  }

  const setProductDataFn = (items: any) => {
    commonDispatch({
      type: 'UPDATE_ITEM',
      payload: items
    });
  }

  const setCartDataFn = (items: any) => {
    commonDispatch({
      type: 'UPDATE_CART',
      payload: items
    });
  }

  const value = {
    open: commonState?.items?.open,
    productData: commonState?.items?.productData,
    cartData: commonState?.items?.cartData,
    setProductDataFn,
    handlePopup,
    setCartDataFn
  };

  return <CommonContext.Provider value={value}>{children}</CommonContext.Provider>;
};

export const useCommonContext = () => {
  const context = useContext(CommonContext);

  if (context === undefined) {
    throw new Error('useCommonContext must be used within a CommonContext');
  }

  return context;
};
