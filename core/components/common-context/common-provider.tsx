'use client';

import { createContext, ReactNode, useContext, useReducer } from 'react';

interface CommonContext {
  open: any;
  productData: any;
  setProductDataFn: (items?: any) => void;
  handlePopup: (data?: any) => void;
}

const CommonContext = createContext<CommonContext | undefined>({
  open: false,
  productData: {},
  setProductDataFn: () => { },
  handlePopup: () => { },
});

function CommonReducer(state: any, action: any) {
  if(action.type === 'UPDATE_ITEM') {
    return {
      items: {
        open: true,
        productData: action.payload
      },
    };
  } else if(action.type === 'DISPLAY_POPUP') {
    return {
      items: {
        productData: { ...state.items.productData },
        open: action.payload,
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
      getMetaFields: []
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

  const value = {
    open: commonState?.items?.open,
    productData: commonState?.items?.productData,
    setProductDataFn,
    handlePopup,
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
