'use client';
import { createContext, ReactNode, useContext, useReducer } from 'react';

interface Image {
  altText: string;
  src: string;
  variantId?: string;
}

interface Video {
  title: string;
  url: string;
  type?: 'youtube' | 'direct';
}

interface CurrentMediaItem {
  type: 'image' | 'video';
  src?: string;
  url?: string;
  altText?: string;
  title?: string;
}

interface CommonContext {
  open: boolean;
  productData: any;
  cartData: any;
  currentMainMedia: CurrentMediaItem | null;
  setProductDataFn: (items?: any) => void;
  handlePopup: (data?: any) => void;
  setCartDataFn: (items?: any) => void;
  setCurrentMainMedia: (media: CurrentMediaItem) => void;
}

const CommonContext = createContext<CommonContext>({
  open: false,
  productData: {},
  cartData: {},
  currentMainMedia: null,
  setProductDataFn: () => {},
  handlePopup: () => {},
  setCartDataFn: () => {},
  setCurrentMainMedia: () => {},
});

function CommonReducer(state: any, action: any) {
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
    case 'SET_CURRENT_MAIN_MEDIA':
      return {
        ...state,
        items: {
          ...state.items,
          currentMainMedia: action.payload,
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
      currentMainMedia: null,
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

  const setCurrentMainMedia = (media: CurrentMediaItem) => {
    commonDispatch({
      type: 'SET_CURRENT_MAIN_MEDIA',
      payload: media,
    });
  };

  const value = {
    open: commonState?.items?.open,
    productData: commonState?.items?.productData,
    cartData: commonState?.items?.cartData,
    currentMainMedia: commonState?.items?.currentMainMedia,
    setProductDataFn,
    handlePopup,
    setCartDataFn,
    setCurrentMainMedia,
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
