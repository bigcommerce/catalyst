// TODO: import this types from bodl-events package?
declare global {
  interface Window {
    bodlEvents?: any;
  }
}
export type bodlEvent = 'bodl_v1_product_page_viewed' | 'bodl_v1_cart_product_added';
// TODO END

export interface bodlConfig {
  channel_id?: string;
}

export interface Analytics {
  init(event: Event): void;
  sendEvent(event: bodlEvent, payload: any): void;
}
