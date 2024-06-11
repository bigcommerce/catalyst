import {
  type BaseProvider,
  CartViewedPayload,
  CategoryViewedPayload,
  ProductAddedPayload,
  ProductRemovedPayload,
  ProductViewedPayload,
  type Provider,
  SearchPayload,
} from './types';

export { BodlProvider } from './providers/bodl';

export class AnalyticsProvider implements BaseProvider {
  private initialized = false;

  constructor(private providers: Provider[]) {}

  private call(func: (provider: Provider) => void): void {
    // Make sure init method is called only once before every event
    if (!this.initialized) {
      this.providers.forEach((provider) => provider.init());
      this.initialized = true;
    }

    this.providers.forEach(func);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  navigation = {
    search: (payload: SearchPayload) => {
      this.call((provider) => provider.navigation.search(payload));
    },
    productViewed: (payload: ProductViewedPayload) => {
      this.call((provider) => provider.navigation.productViewed(payload));
    },
    categoryViewed: (payload: CategoryViewedPayload) => {
      this.call((provider) => provider.navigation.categoryViewed(payload));
    },
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  cart = {
    productAdded: (payload: ProductAddedPayload) => {
      this.call((provider) => provider.cart.productAdded(payload));
    },
    productRemoved: (payload: ProductRemovedPayload) => {
      this.call((provider) => provider.cart.productRemoved(payload));
    },
    cartViewed: (payload: CartViewedPayload) => {
      this.call((provider) => provider.cart.cartViewed(payload));
    },
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  customEvent(payload: unknown): void {
    this.call((provider) => provider.customEvent(payload));
  }
}
