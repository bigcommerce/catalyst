// TODO: define real types of Product, Customer etc
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Product = any;
export type Category = any;
export type Customer = any;
export type Cart = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// All events, supported by analytics provider, will be defined here
export interface SearchPayload {
  query: string;
}

export interface ProductViewedPayload {
  product: Product;
}

export interface CategoryViewedPayload {
  category: Category;
  products: Product[];
}

export interface CategoryFilteredPayload {
  category: Category;
  filters: unknown;
  sort: unknown;
  products: Product[];
}

export interface ProductAddedPayload {
  product: Product;
  quantity: number;
  cart?: Cart;
}

export interface ProductRemovedPayload {
  product: Product;
  cart?: Cart;
}

export interface CartViewedPayload {
  cart: Cart;
}

// Unified interface that every analytics integration should implement
export interface BaseProvider {
  navigation: {
    search: (payload: SearchPayload) => void;
    productViewed: (payload: ProductViewedPayload) => void;
    categoryViewed: (payload: CategoryViewedPayload) => void;
  };
  cart: {
    productAdded: (payload: ProductAddedPayload) => void;
    productRemoved: (payload: ProductRemovedPayload) => void;
    cartViewed: (payload: CartViewedPayload) => void;
  };
  customEvent: (payload: unknown) => void;
}

export interface Provider extends BaseProvider {
  init: () => void;
}
