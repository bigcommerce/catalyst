import { v4 as uuidV4 } from 'uuid';

import type { AnalyticsConfig, AnalyticsProvider, Analytics as IAnalytics } from './types';

export class Analytics implements IAnalytics {
  static #instance: Analytics | null = null;

  readonly cart = this.bindCartEvents();
  readonly navigation = this.bindNavigationEvents();
  readonly consent = this.bindConsentEvents();

  #initializedProviders = new Set<AnalyticsProvider>();

  constructor(private readonly config: AnalyticsConfig) {
    if (!Analytics.#instance) {
      Analytics.#instance = this;
    }

    return Analytics.#instance;
  }

  // Child components fire events from effects that run before the provider's own effect calls
  // this, so events also initialize providers. A provider counts as ready only once its
  // initialize() succeeds, so a failure is retried on the next event.
  initialize() {
    this.readyProviders();
  }

  private readyProviders() {
    return this.config.providers.filter((provider) => {
      if (this.#initializedProviders.has(provider)) return true;

      try {
        provider.initialize();
        this.#initializedProviders.add(provider);

        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize analytics provider', error);

        return false;
      }
    });
  }

  private bindCartEvents() {
    return {
      cartViewed: (payload) => {
        this.readyProviders().forEach((provider) => {
          provider.cart.cartViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productAdded: (payload) => {
        this.readyProviders().forEach((provider) => {
          provider.cart.productAdded(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productRemoved: (payload) => {
        this.readyProviders().forEach((provider) => {
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
        this.readyProviders().forEach((provider) => {
          provider.navigation.categoryViewed(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
      productViewed: (payload) => {
        this.readyProviders().forEach((provider) => {
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
        this.readyProviders().forEach((provider) => {
          provider.consent.consentUpdated(payload, {
            channelId: this.config.channelId,
            eventUuid: uuidV4(),
          });
        });
      },
    } satisfies Analytics.Consent.Events;
  }
}
