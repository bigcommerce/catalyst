'use client';

import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface ProductContext {
  product: any;
  getMetaFields: any;
  setMetaFields: (data?: any) => void;
}

const ProductContext = createContext<ProductContext | undefined>({
  getMetaFields: [],
  setMetaFields: () => { },
});

function ProductReducer(state: any, action: any) {
  if(action.type === 'UPDATE_METAFIELDS') {
    return {
      items: {
        getMetaFields: action.payload
      },
    };
  }
  return state;
}

export const ProductProvider = ({ getMetaFields, children }: { getMetaFields: any, children: ReactNode }) => {
  const [productState, productDispatch] = useReducer(ProductReducer, {
    items: {
      getMetaFields: getMetaFields
    }
  });
  const setMetaFields = (items: any) => {
    productDispatch({
      type: 'UPDATE_METAFIELDS',
      payload: items
    });
  }

  const value = {
    getMetaFields: productState?.items?.getMetaFields,
    setMetaFields
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProductContext = () => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductContext');
  }

  return context;
};
