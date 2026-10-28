import { v4 as uuidV4 } from 'uuid';

import type { AnalyticsConfig, Analytics as IAnalytics } from './types';

export class Analytics implements IAnalytics {
  static #instance: Analytics | null = null;

  readonly cart = this.bindCartEvents();
  readonly navigation = this.bindNavigationEvents();
  readonly consent = this.bindConsentEvents();

  #initialized = false;

  constructor(private readonly config: AnalyticsConfig) {
    if (!Analytics.#instance) {
      Analytics.#instance = this;
    }

    return Analytics.#instance;
  }

  // Child components fire events from effects that run before the provider's own effect calls
  // this, so events initialize lazily and repeat calls are no-ops.
  initialize() {
    if (this.#initialized) return;

    this.#initialized = true;

    this.config.providers.forEach((provider) => {
      provider.initialize();
    });
  }

  private bindCartEvents() {
    return {
      cartViewed: (payload) => {
        this.initialize();

        this.config.providers.forEach((provider) => {
          provider.cart.cartViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productAdded: (payload) => {
        this.initialize();

        this.config.providers.forEach((provider) => {
          provider.cart.productAdded(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productRemoved: (payload) => {
        this.initialize();

        this.config.providers.forEach((provider) => {
          provider.cart.productRemoved(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
    } satisfies Analytics.Cart.Events;
  }

  private bindNavigationEvents() {
    return {
      categoryViewed: (payload) => {
        this.initialize();

        this.config.providers.forEach((provider) => {
          provider.navigation.categoryViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productViewed: (payload) => {
        this.initialize();

        this.config.providers.forEach((provider) => {
          provider.navigation.productViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
    } satisfies Analytics.Navigation.Events;
  }

  private bindConsentEvents() {
    return {
      consentUpdated: (payload) => {
        this.initialize();

        this.config.providers.forEach((provider) => {
          provider.consent.consentUpdated(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
    } satisfies Analytics.Consent.Events;
  }
}
