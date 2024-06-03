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
  constructor(private providers: Provider[]) {}

  // eslint-disable-next-line @typescript-eslint/member-ordering
  navigation = {
    search: (payload: SearchPayload) => {
      this.providers.forEach((provider) => provider.navigation.search(payload));
    },
    productViewed: (payload: ProductViewedPayload) => {
      this.providers.forEach((provider) => provider.navigation.productViewed(payload));
    },
    categoryViewed: (payload: CategoryViewedPayload) => {
      this.providers.forEach((provider) => provider.navigation.categoryViewed(payload));
    },
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  cart = {
    productAdded: (payload: ProductAddedPayload) => {
      this.providers.forEach((provider) => provider.cart.productAdded(payload));
    },
    productRemoved: (payload: ProductRemovedPayload) => {
      this.providers.forEach((provider) => provider.cart.productRemoved(payload));
    },
    cartViewed: (payload: CartViewedPayload) => {
      this.providers.forEach((provider) => provider.cart.cartViewed(payload));
    },
  };

  customEvent(payload: unknown): void {
    this.providers.forEach((provider) => provider.customEvent(payload));
  }

  init() {
    this.providers.forEach((provider) => provider.init());
  }
}
