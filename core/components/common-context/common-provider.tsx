'use client';

import { createContext, ReactNode, useContext, useReducer, useEffect } from 'react';

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

interface DeletedProductInfo {
  productId: number;
  wishlistId: number;
  timestamp: number;
}

interface CommonContext {
  open: boolean;
  productData: any;
  cartData: any;
  currentMainMedia: CurrentMediaItem | null;
  deletedProductIds: DeletedProductInfo[];
  setProductDataFn: (items?: any) => void;
  handlePopup: (data?: any) => void;
  setCartDataFn: (items?: any) => void;
  setCurrentMainMedia: (media: CurrentMediaItem) => void;
  setDeletedProductId: (productId: number, wishlistId: number, action?: 'add' | 'remove') => void;
}

const CommonContext = createContext<CommonContext>({
  open: false,
  productData: {},
  cartData: {},
  currentMainMedia: null,
  deletedProductIds: [],
  setProductDataFn: () => {},
  handlePopup: () => {},
  setCartDataFn: () => {},
  setCurrentMainMedia: () => {},
  setDeletedProductId: () => {},
});

interface CommonState {
  items: {
    open: boolean;
    productData: any;
    cartData: any;
    currentMainMedia: CurrentMediaItem | null;
    deletedProductIds: DeletedProductInfo[];
  };
}

type CommonAction =
  | { type: 'UPDATE_ITEM'; payload: any }
  | { type: 'DISPLAY_POPUP'; payload: boolean }
  | { type: 'UPDATE_CART'; payload: any }
  | { type: 'SET_CURRENT_MAIN_MEDIA'; payload: CurrentMediaItem }
  | {
      type: 'SET_DELETED_PRODUCT';
      payload: {
        productId: number;
        wishlistId: number;
        action?: 'add' | 'remove';
      };
    }
  | {
      type: 'LOAD_DELETED_PRODUCTS';
      payload: DeletedProductInfo[];
    };

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

    case 'SET_CURRENT_MAIN_MEDIA':
      return {
        ...state,
        items: {
          ...state.items,
          currentMainMedia: action.payload,
        },
      };

    case 'SET_DELETED_PRODUCT': {
      const { productId, wishlistId, action: deleteAction = 'add' } = action.payload;

      if (deleteAction === 'remove') {
        return {
          ...state,
          items: {
            ...state.items,
            deletedProductIds: state.items.deletedProductIds.filter(
              (item) => !(item.productId === productId && item.wishlistId === wishlistId),
            ),
          },
        };
      }

      const newDeletion: DeletedProductInfo = {
        productId,
        wishlistId,
        timestamp: Date.now(),
      };

      return {
        ...state,
        items: {
          ...state.items,
          deletedProductIds: [...state.items.deletedProductIds, newDeletion],
        },
      };
    }

    case 'LOAD_DELETED_PRODUCTS':
      return {
        ...state,
        items: {
          ...state.items,
          deletedProductIds: action.payload,
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
      deletedProductIds: [],
    },
  });

  // Initialize and sync with IndexedDB
  // Initialize and sync with IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open('WishlistDB', 4);

        request.onerror = () => console.error('Error opening IndexedDB');

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (db.objectStoreNames.contains('deletedProducts')) {
            db.deleteObjectStore('deletedProducts');
          }
          const store = db.createObjectStore('deletedProducts', {
            keyPath: ['productId', 'wishlistId'],
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        };

        request.onsuccess = (event: Event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['deletedProducts'], 'readonly');
          const store = transaction.objectStore('deletedProducts');

          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => {
            if (getAllRequest.result?.length > 0) {
              commonDispatch({
                type: 'LOAD_DELETED_PRODUCTS',
                payload: getAllRequest.result,
              });
            }
          };
        };
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    initDB();
  }, []);

  // Sync deletions with IndexedDB
  useEffect(() => {
    const syncDeletedProducts = async () => {
      try {
        const request = indexedDB.open('WishlistDB', 4);

        request.onsuccess = (event: Event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['deletedProducts'], 'readwrite');
          const store = transaction.objectStore('deletedProducts');

          // Clear existing records
          const clearRequest = store.clear();

          clearRequest.onsuccess = () => {
            // Add current deletions
            commonState.items.deletedProductIds.forEach((deletion) => {
              store.put(deletion);
            });
          };
        };
      } catch (error) {
        console.error('Error syncing with IndexedDB:', error);
      }
    };

    if (commonState.items.deletedProductIds.length > 0) {
      syncDeletedProducts();
    }
  }, [commonState.items.deletedProductIds]);

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

  const setDeletedProductId = (
    productId: number,
    wishlistId: number,
    action: 'add' | 'remove' = 'add',
  ) => {
    commonDispatch({
      type: 'SET_DELETED_PRODUCT',
      payload: { productId, wishlistId, action },
    });
  };

  const value = {
    open: commonState.items.open,
    productData: commonState.items.productData,
    cartData: commonState.items.cartData,
    currentMainMedia: commonState.items.currentMainMedia,
    deletedProductIds: commonState.items.deletedProductIds,
    setProductDataFn,
    handlePopup,
    setCartDataFn,
    setCurrentMainMedia,
    setDeletedProductId,
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
