declare namespace Analytics {
  interface Metadata {
    channelId: number;
    eventUuid: string;
  }

  interface Product {
    // Required fields by most analytics providers

    id: string;
    name: string;

    // Optional fields and may not be provided in some cases

    brand?: string;
    sku?: string;
    /**
     * A breadcrumb of the category names
     *
     * @example ["Electronics", "Computers", "Laptops"]
     */
    categories?: string[];
    /** Individual item price, without multiplying the quantity */
    price?: number;
    quantity?: number;
    variant_id?: number;
  }

  namespace Navigation {
    interface ProductViewedPayload {
      currency: string;
      value: number;
      items: Product[];
    }

    interface CategoryViewedPayload {
      id: number;
      name: string;
      currency: string;
      items: Product[];
    }

    interface ProviderEvents {
      categoryViewed: (payload: CategoryViewedPayload, metadata: Metadata) => void;
      productViewed: (payload: ProductViewedPayload, metadata: Metadata) => void;
    }

    export interface Events {
      categoryViewed: (payload: CategoryViewedPayload) => void;
      productViewed: (payload: ProductViewedPayload) => void;
    }
  }

  export namespace Cart {
    interface ProductAddedPayload {
      currency: string;
      /**
       * Price of the item multiplied by the quantity
       * @example 25.0 * 3 = 75.0 // Use 75.0
       */
      value: number;
      items: Product[];
    }

    interface CartViewedPayload {
      currency: string;
      value: number;
      items: Product[];
    }

    interface ProductRemovedPayload {
      currency: string;
      value: number;
      items: Product[];
    }

    interface ProviderEvents {
      cartViewed: (payload: CartViewedPayload, metadata: Metadata) => void;
      productAdded: (payload: ProductAddedPayload, metadata: Metadata) => void;
      productRemoved: (payload: ProductRemovedPayload, metadata: Metadata) => void;
    }

    export interface Events {
      cartViewed: (payload: CartViewedPayload) => void;
      productAdded: (payload: ProductAddedPayload) => void;
      productRemoved: (payload: ProductRemovedPayload) => void;
    }
  }
}
