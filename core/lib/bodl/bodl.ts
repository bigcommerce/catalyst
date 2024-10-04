import type BodlEvents from '@bigcommerce/bodl-events';
import { v4 as uuidv4 } from 'uuid';

import { subscribeOnBodlEvents } from './providers/ga4/google_analytics4';

declare global {
  interface Window {
    bodlEvents?: typeof BodlEvents;
  }
}

interface BodlGoogleAnalyticsConfig {
  id?: string;
  consentModeEnabled?: boolean;
  developerId?: string;
}

interface BodlConfig {
  channelId: number;
  googleAnalytics: BodlGoogleAnalyticsConfig;
}

export class Bodl {
  static #instance: Bodl | null = null;

  readonly cart = this.getCartEvents();
  readonly navigation = this.getNavigationEvents();

  constructor(private config: BodlConfig) {
    if (Bodl.#instance) {
      return Bodl.#instance;
    }

    Bodl.#instance = this;
  }

  static waitForBodlEvents(callback: () => void, iteration = 0) {
    if (window.bodlEvents) {
      callback();

      return;
    }

    if (iteration >= 10) {
      return;
    }

    setTimeout(() => {
      this.waitForBodlEvents(callback, iteration + 1);
    }, 1000);
  }

  initialize() {
    try {
      this.assertsValidConfig(this.config);

      if (typeof window === 'undefined') {
        throw new Error('Bodl is only available in the browser environment');
      }

      this.bindJavascriptLibrary();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error);
    }
  }

  private assertsValidConfig(config?: BodlConfig): asserts config is BodlConfig {
    if (!this.config.channelId) {
      throw new Error('Bodl requires a channel ID');
    }

    if (!this.config.googleAnalytics.id) {
      throw new Error('Bodl requires a Google Analytics ID');
    }
  }

  private bindJavascriptLibrary() {
    // Subscribe analytic providers to BODL events here
    const load = () => {
      subscribeOnBodlEvents(
        this.config.googleAnalytics.id,
        this.config.googleAnalytics.developerId,
        this.config.googleAnalytics.consentModeEnabled,
      );
    };

    const el = document.getElementsByTagName('body')[0];

    if (!el) return;

    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';
    script.onload = load;
    el.appendChild(script);
  }

  private getCartEvents() {
    return {
      productAdded: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.cart.emit('bodl_v1_cart_product_added', {
            event_id: uuidv4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
      productRemoved: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.cart.emit('bodl_v1_cart_product_removed', {
            event_id: uuidv4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
      cartViewed: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.cart.emit('bodl_v1_cart_viewed', {
            event_id: uuidv4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
    } satisfies Analytics.Cart.Events;
  }

  private getNavigationEvents() {
    return {
      productViewed: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.product.emit('bodl_v1_product_page_viewed', {
            event_id: uuidv4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
      categoryViewed: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.product.emit('bodl_v1_product_category_viewed', {
            event_id: uuidv4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
    } satisfies Analytics.Navigation.Events;
  }
}
