// TODO: import this types from bodl-events package?
declare global {
  interface Window {
    bodlEvents?: {
      cart?: {
        emit: (event: string, payload: unknown) => void;
      };
      product?: {
        emit: (event: string, payload: unknown) => void;
      };
    };
  }
}

export interface BodlConfig {
  channel_id: number;
  ga4?: {
    gaId: string;
    consentModeEnabled: boolean;
  };
}

interface line_item {
  product_id: string;
  product_name: string;
  brand_name?: string;
  sku?: string;
  sale_price?: number;
  purchase_price: number;
  base_price?: number;
  retail_price?: number;
  currency: string;
  category_names?: string[];
  variant_id?: number[];
  quantity?: number;
}

export interface bodl_v1_product_page_viewed {
  currency: string;
  product_value: number;
  line_items: line_item[];
}

export interface bodl_v1_product_category_viewed {
  category_id: number;
  category_name: string;
  line_items: line_item[];
}

export interface bodl_v1_cart_product_added {
  currency: string;
  product_value: number;
  line_items: line_item[];
}

export interface bodl_v1_cart_viewed {
  currency: string;
  cart_value: number;
  line_items: line_item[];
}

export interface bodl_v1_cart_product_removed {
  currency: string;
  product_value: number;
  line_items: line_item[];
}
