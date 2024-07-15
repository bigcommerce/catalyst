import { v4 as uuidv4 } from 'uuid';

import { subscribeOnBodlEvents } from './providers/ga4/google_analytics4';
import { bodl_v1_cart_product_added, bodl_v1_product_page_viewed } from './types';

interface BodlConfig {
  channel_id: number;
  ga4?: {
    gaId: string;
    developerId: number;
    consentModeEnabled: boolean;
  };
}

export class Bodl {
  private static globalSingleton: Bodl | null = null;

  constructor(private config: BodlConfig) {
    if (typeof window == 'undefined') {
      console.warn('Bodl must be initialized in browser environment.');

      return;
    }

    if (!config.ga4) {
      console.warn('GA4 configuration is missing.');

      return;
    }

    this.bindJavascriptLibrary();

    if (!Bodl.globalSingleton) {
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
        this.config.ga4?.developerId,
        this.config.ga4?.consentModeEnabled,
      );
    };

    // TODO: This is a workaround init while import from @bigcommerce/bodl-events doesn't work properly
    const el = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';
    script.onload = load;
    el.appendChild(script);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  navigation = {
    search: this.call((payload: any) => null),
    productViewed: this.call<bodl_v1_product_page_viewed>((payload) => {
      window.bodlEvents?.product?.emit('bodl_v1_product_page_viewed', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
    categoryViewed: this.call((payload: any) => null),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  cart = {
    productAdded: this.call<bodl_v1_cart_product_added>((payload) => {
      window.bodlEvents?.cart?.emit('bodl_v1_cart_product_added', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        ...payload,
      });
    }),
    productRemoved: this.call((payload: any) => null),
    cartViewed: this.call((payload: any) => null),
  };

  customEvent(payload: unknown) {
    return null;
  }

  private call<T>(originalMethod: (payload: T) => void) {
    return (payload: T) => {
      if (!window.bodlEvents) {
        // TODO: temporary hack - wait for bodl-events script to be loaded
        setTimeout(originalMethod.bind(this, payload), 500);

        console.warn('Bodl is not initialized, call init method first.');

        return;
      }

      originalMethod.apply(this, [payload]);
    };
  }
}
