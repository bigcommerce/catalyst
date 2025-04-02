import { v4 as uuidV4 } from 'uuid';

import type { AnalyticsConfig, Analytics as IAnalytics } from './types';

export class Analytics implements IAnalytics {
  static #instance: Analytics | null = null;

  readonly cart = this.bindCartEvents();
  readonly navigation = this.bindNavigationEvents();

  constructor(private readonly config: AnalyticsConfig) {
    if (!Analytics.#instance) {
      Analytics.#instance = this;
    }

    return Analytics.#instance;
  }

  initialize() {
    this.config.providers.forEach((provider) => {
      provider.initialize();
    });
  }

  private bindCartEvents() {
    return {
      cartViewed: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.cart.cartViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productAdded: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.cart.productAdded(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productRemoved: (payload) => {
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
        this.config.providers.forEach((provider) => {
          provider.navigation.categoryViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productViewed: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.navigation.productViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
    } satisfies Analytics.Navigation.Events;
  }
}
