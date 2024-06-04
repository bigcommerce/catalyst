import { v4 as uuidv4 } from 'uuid';

import {
  CartViewedPayload,
  CategoryViewedPayload,
  Product,
  ProductAddedPayload,
  ProductRemovedPayload,
  ProductViewedPayload,
  Provider,
  SearchPayload,
} from '../../types';

import { type Ga4Config, subscribeOnBodlEvents } from './ga4';

// TODO: import this types from bodl-events package?
declare global {
  interface Window {
    bodlEvents?: {
      cart?: {
        emit: (event: string, payload: unknown) => void;
      };
      product?: {
        emit: (event: string, payload: unknown) => void;
      };
    };
  }
}

export interface BodlConfig {
  // More analytics providers supported by BODL can be added here
  ga4?: Ga4Config;
}

const lineItemTransform = (product: Product) => {
  const categoryNames = product.categories?.edges
    .map((category: { node: { breadcrumbs: any } }) => category.node.breadcrumbs.edges)
    .map((breadcrumb: { node: { name: any } }) => breadcrumb.node.name);

  return {
    product_id: product.entityId,
    product_name: product.name,
    brand_name: product.brand?.name,
    sku: product.sku,
    sale_price: product.prices?.salePrice?.value,
    purchase_price: product.prices?.price.value || product.prices?.salePrice?.value,
    base_price: product.prices?.price.value,
    retail_price: product.prices?.retailPrice?.value || null,
    currency: product.prices?.price.currencyCode,
    category_names: categoryNames,
    variant_id: product.variants?.edges.map(
      (variant: { node: { entityId: any } }) => variant.node.entityId,
    ),
  };
};

export class BodlProvider implements Provider {
  private initialized = false;

  constructor(private config: BodlConfig) {}

  // eslint-disable-next-line @typescript-eslint/member-ordering
  navigation = {
    search: (payload: SearchPayload) => null,
    productViewed: (payload: ProductViewedPayload) => {
      window.bodlEvents?.product?.emit('bodl_v1_product_page_viewed', {
        event_id: uuidv4(),
        product_value: payload.product.prices?.price.value,
        currency: payload.product.prices?.price.currencyCode,
        line_items: [lineItemTransform(payload.product)],
      });
    },
    categoryViewed: (payload: CategoryViewedPayload) => null,
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  cart = {
    productAdded: (payload: ProductAddedPayload) => {
      window.bodlEvents?.cart?.emit('bodl_v1_cart_product_added', {
        event_id: uuidv4(),
        product_value: payload.product.prices?.price.value * payload.quantity,
        currency: payload.product.prices?.price.currencyCode,
        line_items: [
          {
            ...lineItemTransform(payload.product),
            quantity: payload.quantity,
          },
        ],
      });
    },
    productRemoved: (payload: ProductRemovedPayload) => null,
    cartViewed: (payload: CartViewedPayload) => null,
  };

  customEvent(payload: unknown) {
    return null;
  }

  // RECOMMENDATION: This method could be return a singleton that could be called in every event call to avoid multiple initialization
  init() {
    if (typeof window == 'undefined') {
      console.warn('Bodl must be initialized in browser environment.');

      return;
    }

    if (!this.config.ga4) {
      console.warn('GA4 configuration is missing.');

      return;
    }

    if (this.initialized) {
      return;
    }

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
    this.initialized = true;
  }
}
