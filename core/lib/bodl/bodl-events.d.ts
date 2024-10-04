/* eslint-disable max-classes-per-file */

// Imported from https://microapps.bigcommerce.com/bodl-events/index.d.ts
declare module '@bigcommerce/bodl-events' {
  interface BodlFirstTouch {
    timestamp: string;
    referralUrl: string;
    requestUrl: string;
  }

  interface BodlSession {
    id: string;
    firstTouch: BodlFirstTouch;
  }

  interface BodlShopper {
    shopperProfileId: string;
    visitorId: string;
    customerId?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
  }

  interface BodlConsent {
    functional: boolean;
    analytics: boolean;
    advertising: boolean;
  }

  interface Bodl$1 {
    session: BodlSession;
    shopper: BodlShopper;
    scriptConsent: BodlConsent;
    events: BodlBackendEvent[];
  }

  type BodlBackendEvent = Record<string, Record<string, unknown>>;

  interface BodlEvent {
    name: string;
    callback: BodlEventCallback;
  }

  type BoldEventPayload = Record<string, unknown>;
  declare type BodlEventCallback = (payload: BoldEventPayload) => void;

  declare const isBodlEnabled: () => boolean;
  declare const getBodl: () => Bodl$1 | null;
  declare const addBodlEvent: (event: BodlEvent['name'], payload: BoldEventPayload) => void;

  declare const Bodl_isBodlEnabled: typeof isBodlEnabled;
  declare const Bodl_getBodl: typeof getBodl;
  declare const Bodl_addBodlEvent: typeof addBodlEvent;
  declare namespace Bodl {
    export {
      Bodl_isBodlEnabled as isBodlEnabled,
      Bodl_getBodl as getBodl,
      Bodl_addBodlEvent as addBodlEvent,
    };
  }

  interface HistoryEvent {
    name: string;
    payload: BoldEventPayload;
  }

  declare class HistoryManager {
    private events;
    getHistory(name: string): HistoryEvent[];
    getFullHistory(): HistoryEvent[];
    addEvent(name: string, payload: BoldEventPayload): void;
  }

  declare class EventEmitter {
    private eventEmitter;
    private historyManager?;
    private updateBodl;
    constructor(eventEmitter: EventEmitter, historyManager?: HistoryManager | undefined);
    emit(eventName: string, payload: BoldEventPayload): boolean;
    on(eventName: string, callback: (payload: BoldEventPayload) => void): this;
    off(eventName: string, callback: (payload: BoldEventPayload) => void): this;
    replayEvents(events: HistoryEvent[], callback: (payload: BoldEventPayload) => void): void;
  }

  declare class ConsentEmitter extends EventEmitter {
    emitConsentLoadedEvent(data: BoldEventPayload): boolean;
    emitConsentUpdatedEvent(data: BoldEventPayload): boolean;
    loaded(callback: BodlEventCallback): this;
    updated(callback: BodlEventCallback): this;
  }

  declare class BannerEmitter extends EventEmitter {
    viewed(callback: BodlEventCallback): this;
  }

  declare enum AddCartItemEvent {
    CREATE = 'bodl_v1_cart_product_added',
  }
  declare enum RemoveCartItemEvent {
    CREATE = 'bodl_v1_cart_product_removed',
  }
  declare class CartEmitter extends EventEmitter {
    addItem(callback: BodlEventCallback): this;
    removeItem(callback: BodlEventCallback): this;
    viewed(callback: BodlEventCallback): this;
  }

  declare enum CheckoutBeginEvent {
    CREATE = 'bodl_v1_begin_checkout',
  }
  declare enum OrderPurchasedEvent {
    CREATE = 'bodl_v1_order_purchased',
  }
  declare class CheckoutEmitter extends EventEmitter {
    emitCheckoutBeginEvent(data: BoldEventPayload): boolean;
    emitOrderPurchasedEvent(data: BoldEventPayload): boolean;
    emitShippingDetailsProvidedEvent(data: BoldEventPayload): boolean;
    emitPaymentDetailsProvidedEvent(data: BoldEventPayload): boolean;
    shippingDetailsProvided(callback: BodlEventCallback): this;
    paymentDetailsProvided(callback: BodlEventCallback): this;
    checkoutBegin(callback: BodlEventCallback): this;
    orderPurchased(callback: BodlEventCallback): this;
  }

  declare class ProductEmitter extends EventEmitter {
    pageViewed(callback: BodlEventCallback): this;
    categoryViewed(callback: BodlEventCallback): this;
    searchPerformed(callback: BodlEventCallback): this;
  }

  declare const cart: CartEmitter;
  declare const checkout: CheckoutEmitter;
  declare const product: ProductEmitter;
  declare const banner: BannerEmitter;
  declare const consent: ConsentEmitter;
  // eslint-disable-next-line no-underscore-dangle
  declare const _default: {
    cart: CartEmitter;
    checkout: CheckoutEmitter;
    product: ProductEmitter;
    banner: BannerEmitter;
    consent: ConsentEmitter;
    version: string;
  };

  export {
    AddCartItemEvent,
    CheckoutBeginEvent,
    OrderPurchasedEvent,
    RemoveCartItemEvent,
    banner,
    Bodl as bodl,
    cart,
    checkout,
    consent,
    _default as default,
    product,
  };
}
