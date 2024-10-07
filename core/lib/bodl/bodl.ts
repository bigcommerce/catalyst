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
  readonly consent = this.getConsentEvents();

  private readonly bodlScriptId = 'bodl-events-script';
  private readonly dataLayerScriptId = 'data-layer-script';
  private readonly gtagScriptId = 'gtag-script';

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

      this.initializeBodlEvents();
      this.initializeDataLayer();
      this.initializeGTM();
      this.initializeConsentMode();

      this.bindEvents();

      Bodl.waitForBodlEvents(() => {
        subscribeOnBodlEvents(
          this.config.googleAnalytics.id,
          this.config.googleAnalytics.consentModeEnabled,
        );
      });
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

  private initializeBodlEvents() {
    const existingScript = document.getElementById(this.bodlScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.bodlScriptId;
    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';

    document.body.appendChild(script);
  }

  private initializeDataLayer() {
    const existingScript = document.getElementById(this.dataLayerScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.dataLayerScriptId;
    script.type = 'text/javascript';
    script.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('set', 'developer_id.${this.config.googleAnalytics.developerId}', true);
      gtag('config', '${this.config.googleAnalytics.id}');
    `;

    document.body.appendChild(script);
  }

  private initializeGTM() {
    const existingScript = document.getElementById(this.gtagScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.gtagScriptId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.id}`;
    script.async = true;

    document.head.appendChild(script);
  }

  private initializeConsentMode() {
    if (!this.config.googleAnalytics.consentModeEnabled) {
      return;
    }

    gtag('consent', 'default', {
      ad_personalization: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
    });
  }

  private bindEvents() {
    this.bindConsentEvents();
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

  private getConsentEvents() {
    return {
      consentLoaded: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.consent.emit('bodl_v1_consent_loaded', {
            event_id: uuidv4(),
            ...payload,
          });
        });
      },
      consentUpdated: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.consent.emit('bodl_v1_consent_updated', {
            event_id: uuidv4(),
            ...payload,
          });
        });
      },
    } satisfies Analytics.Consent.Events;
  }

  private bindConsentEvents() {
    Bodl.waitForBodlEvents(() => {
      window.bodlEvents?.consent.loaded((payload) => {
        gtag('consent', 'update', {
          ad_personalization: payload.advertising ? 'granted' : 'denied',
          ad_storage: payload.advertising ? 'granted' : 'denied',
          ad_user_data: payload.advertising ? 'granted' : 'denied',
          analytics_storage: payload.analytics ? 'granted' : 'denied',
          functionality_storage: payload.functional ? 'granted' : 'denied',
        });
      });

      window.bodlEvents?.consent.updated((payload) => {
        gtag('consent', 'update', {
          ad_personalization: payload.advertising ? 'granted' : 'denied',
          ad_storage: payload.advertising ? 'granted' : 'denied',
          ad_user_data: payload.advertising ? 'granted' : 'denied',
          analytics_storage: payload.analytics ? 'granted' : 'denied',
          functionality_storage: payload.functional ? 'granted' : 'denied',
        });
      });
    });
  }
}
