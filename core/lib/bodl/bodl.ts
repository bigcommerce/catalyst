import { v4 as uuidv4 } from 'uuid';

import { subscribeOnBodlEvents } from './providers/ga4/google_analytics4';
import {
  bodl_v1_cart_product_added,
  bodl_v1_cart_product_removed,
  bodl_v1_cart_viewed,
  bodl_v1_product_category_viewed,
  bodl_v1_product_page_viewed,
  BodlConfig,
} from './types';

export class Bodl {
  private static globalSingleton: Bodl | null = null;
  private static ga4DeveloperId = 'dMjk3Nj';

  navigation = {
    // search: this.call((payload: any) => null),
    productViewed: this.call<bodl_v1_product_page_viewed>((payload) => {
      window.bodlEvents?.product?.emit('bodl_v1_product_page_viewed', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
    categoryViewed: this.call<bodl_v1_product_category_viewed>((payload) => {
      window.bodlEvents?.product?.emit('bodl_v1_product_category_viewed', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
  };

  cart = {
    productAdded: this.call<bodl_v1_cart_product_added>((payload) => {
      window.bodlEvents?.cart?.emit('bodl_v1_cart_product_added', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
    productRemoved: this.call<bodl_v1_cart_product_removed>((payload) => {
      window.bodlEvents?.cart?.emit('bodl_v1_cart_product_removed', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
    cartViewed: this.call<bodl_v1_cart_viewed>((payload) => {
      window.bodlEvents?.cart?.emit('bodl_v1_cart_viewed', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
  };

  constructor(private config: BodlConfig) {
    if (typeof window == 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('Bodl must be initialized in browser environment.');

      return;
    }

    if (!config.ga4?.gaId) {
      // eslint-disable-next-line no-console
      console.warn('GA4 configuration is missing.');

      return;
    }

    if (!Bodl.globalSingleton) {
      this.bindJavascriptLibrary();

      Bodl.globalSingleton = this;

      return this;
    }

    return Bodl.globalSingleton;
  }

  private bindJavascriptLibrary() {
    // Subscribe analytic providers to BODL events here
    const load = () => {
      subscribeOnBodlEvents(
        this.config.ga4?.gaId,
        Bodl.ga4DeveloperId,
        this.config.ga4?.consentModeEnabled,
      );
    };

    // TODO: This is a workaround init while import from @bigcommerce/bodl-events doesn't work properly
    const el = document.getElementsByTagName('body')[0];

    if (!el) return;

    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';
    script.onload = load;
    el.appendChild(script);
  }

  private call<T>(originalMethod: (payload: T) => void) {
    return (payload: T) => {
      if (Bodl.globalSingleton === null) {
        return;
      }

      if (!window.bodlEvents) {
        // TODO: temporary hack - wait for bodl-events script to be loaded
        setTimeout(originalMethod.bind(this, payload), 500);

        // eslint-disable-next-line no-console
        console.warn('Bodl is not initialized, call constructor first.');

        return;
      }

      originalMethod.apply(this, [payload]);
    };
  }
}
