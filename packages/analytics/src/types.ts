// TODO: define real types of Product, Customer etc
export type Product = any;
export type Customer = any;

// All events, supported by analytics provider, will be defined here
export interface ProductViewedEvent {
  type: 'product_viewed';
  product: Product;
}

export interface CartAddedEvent {
  type: 'cart_added';
  product: Product;
  quantity: number;
}

export interface CustomEvent {
  type: 'custom_event';
  payload: any;
}

export type AnalyticsEvent = ProductViewedEvent | CartAddedEvent | CustomEvent;

export interface AnalyticsConfig {
  channel_id: string;
}

// Unified interface that every analytics integration should implement
export interface Analytics {
  init: (globalConfig?: AnalyticsConfig) => void;
  trackEvent: (event: AnalyticsEvent, globalConfig?: AnalyticsConfig) => void;
  setCustomer: (customer: Customer, globalConfig?: AnalyticsConfig) => void;
}

export type AnalyticsProvider = Analytics;
