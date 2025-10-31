import { AnalyticsProvider } from '~/lib/analytics/types';

interface GoogleAnalyticsConfig {
  gaId: string;
  developerId?: string;
  debugMode?: boolean;
}

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  static #instance: GoogleAnalyticsProvider | null = null;

  readonly cart = this.getCartEvents();
  readonly navigation = this.getNavigationEvents();

  constructor(private readonly config: GoogleAnalyticsConfig) {
    if (GoogleAnalyticsProvider.#instance) {
      return GoogleAnalyticsProvider.#instance;
    }

    GoogleAnalyticsProvider.#instance = this;
  }

  initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Google Analytics is only available in the browser environment');
    }

    // Wait for gtag to be available (loaded by c15t)
    void this.waitForGtag().then(() => {
      this.configureGA();
    });
  }

  private async waitForGtag(): Promise<void> {
    // Wait for gtag to be loaded by c15t
    return new Promise((resolve) => {
      // Check if gtag is already available
      if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
        resolve();

        return;
      }

      let resolved = false;
      let timeout: NodeJS.Timeout;

      // Poll for gtag availability
      const checkGtag = setInterval(() => {
        if (typeof gtag !== 'undefined') {
          clearInterval(checkGtag);
          clearTimeout(timeout);
          resolved = true;
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      timeout = setTimeout(() => {
        if (!resolved) {
          clearInterval(checkGtag);
          // eslint-disable-next-line no-console
          console.warn('gtag did not load within 10 seconds');
          resolve();
        }
      }, 10000);
    });
  }

  private configureGA() {
    if (typeof gtag === 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('gtag is not available');

      return;
    }

    // Optional: Set developer ID if provided
    if (this.config.developerId) {
      gtag('set', `developer_id.${this.config.developerId}`, true);
    }

    // Optional: Enable debug mode
    if (this.config.debugMode) {
      gtag('config', this.config.gaId, { debug_mode: true });
    }
  }

  private getCartEvents() {
    return {
      cartViewed: (payload, metadata) => {
        gtag('event', 'view_cart', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          currency: payload.currency,
          value: payload.value,
          items: payload.items.map((item) => {
            return {
              item_name: item.name,
              item_id: item.sku ?? item.id,
              price: item.price,
              quantity: item.quantity,
              currency: payload.currency,
              item_brand: item.brand,
              variant_id: item.variant_id,
              item_category: item.categories?.at(0),
              item_category2: item.categories?.at(1),
              item_category3: item.categories?.at(2),
              item_category4: item.categories?.at(3),
              item_category5: item.categories?.at(4),
            };
          }),
        });
      },
      productAdded: (payload, metadata) => {
        gtag('event', 'add_to_cart', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          currency: payload.currency,
          value: payload.value,
          items: payload.items.map((item) => {
            return {
              item_name: item.name,
              item_id: item.sku ?? item.id,
              price: item.price,
              quantity: item.quantity,
              currency: payload.currency,
              item_brand: item.brand,
              variant_id: item.variant_id,
              item_category: item.categories?.at(0),
              item_category2: item.categories?.at(1),
              item_category3: item.categories?.at(2),
              item_category4: item.categories?.at(3),
              item_category5: item.categories?.at(4),
            };
          }),
        });
      },
      productRemoved: (payload, metadata) => {
        gtag('event', 'remove_from_cart', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          currency: payload.currency,
          value: payload.value,
          items: payload.items.map((item) => {
            return {
              item_name: item.name,
              item_id: item.sku ?? item.id,
              price: item.price,
              quantity: item.quantity,
              currency: payload.currency,
              item_brand: item.brand,
              variant_id: item.variant_id,
              item_category: item.categories?.at(0),
              item_category2: item.categories?.at(1),
              item_category3: item.categories?.at(2),
              item_category4: item.categories?.at(3),
              item_category5: item.categories?.at(4),
            };
          }),
        });
      },
    } satisfies Analytics.Cart.ProviderEvents;
  }

  private getNavigationEvents() {
    return {
      categoryViewed: (payload, metadata) => {
        gtag('event', 'view_item_list', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          item_list_id: payload.id,
          item_list_name: payload.name,
          items: payload.items.map((item) => {
            return {
              item_name: item.name,
              item_id: item.sku ?? item.id,
              price: item.price,
              quantity: item.quantity,
              currency: payload.currency,
              item_brand: item.brand,
              variant_id: item.variant_id,
              item_category: item.categories?.at(0),
              item_category2: item.categories?.at(1),
              item_category3: item.categories?.at(2),
              item_category4: item.categories?.at(3),
              item_category5: item.categories?.at(4),
            };
          }),
        });
      },
      productViewed: (payload, metadata) => {
        gtag('event', 'view_item', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          currency: payload.currency,
          value: payload.value,
          items: payload.items.map((item) => {
            return {
              item_name: item.name,
              item_id: item.sku ?? item.id,
              price: item.price,
              quantity: item.quantity,
              currency: payload.currency,
              item_brand: item.brand,
              variant_id: item.variant_id,
              item_category: item.categories?.at(0),
              item_category2: item.categories?.at(1),
              item_category3: item.categories?.at(2),
              item_category4: item.categories?.at(3),
              item_category5: item.categories?.at(4),
            };
          }),
        });
      },
    } satisfies Analytics.Navigation.ProviderEvents;
  }
}
